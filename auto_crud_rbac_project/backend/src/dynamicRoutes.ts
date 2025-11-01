import { Express, Request, Response } from "express";
import { prisma } from "./prismaClient";
import { ModelDef } from "./modelsLoader";
import { rbacMiddleware } from "./rbac";

export function registerModelRoutes(app: Express, model: ModelDef) {
  const base = `/api/${(model.tableName || model.name).toLowerCase()}`;

  // Create
  app.post(base, rbacMiddleware(model, "create"), async (req: Request, res: Response) => {
    const user = req.user!;
    const payload = req.body;

    const missing = (model.fields || []).filter((f) => f.required && payload[f.name] == null);
    if (missing.length) return res.status(400).json({ error: "Missing fields", missing: missing.map((m) => m.name) });

    if (model.ownerField) {
      payload[model.ownerField] = payload[model.ownerField] || user.id;
    }

    const rec = await prisma.record.create({
      data: { modelName: model.name, data: payload, ownerId: model.ownerField ? payload[model.ownerField] : undefined },
    });

    return res.json(rec);
  });

  // List
  app.get(base, rbacMiddleware(model, "read"), async (req: Request, res: Response) => {
    const items = await prisma.record.findMany({ where: { modelName: model.name } });
    return res.json(items);
  });

  // Get by id
  app.get(`${base}/:id`, rbacMiddleware(model, "read"), async (req: Request, res: Response) => {
    const id = req.params.id;
    const item = await prisma.record.findUnique({ where: { id } });
    if (!item || item.modelName !== model.name) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  });

  // Update
  app.put(`${base}/:id`, rbacMiddleware(model, "update"), async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user!;
    const item = await prisma.record.findUnique({ where: { id } });
    if (!item || item.modelName !== model.name) return res.status(404).json({ error: "Not found" });

    if (model.ownerField && item.ownerId && user.role !== "Admin" && item.ownerId !== user.id) {
      return res.status(403).json({ error: "Forbidden: not owner" });
    }

    const newData = { ...(item.data as any), ...req.body };
    const updated = await prisma.record.update({ where: { id }, data: { data: newData } });
    return res.json(updated);
  });

  // Delete
  app.delete(`${base}/:id`, rbacMiddleware(model, "delete"), async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user!;
    const item = await prisma.record.findUnique({ where: { id } });
    if (!item || item.modelName !== model.name) return res.status(404).json({ error: "Not found" });

    if (model.ownerField && item.ownerId && user.role !== "Admin" && item.ownerId !== user.id) {
      return res.status(403).json({ error: "Forbidden: not owner" });
    }

    await prisma.record.delete({ where: { id } });
    return res.json({ ok: true });
  });
}
