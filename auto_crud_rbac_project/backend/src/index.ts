import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { loadModels, writeModelFile, ModelDef } from "./modelsLoader";
import { registerModelRoutes } from "./dynamicRoutes";
import { ensureSeedUsers, generateToken } from "./auth";
import { prisma } from "./prismaClient";
import { mockAuth as authMiddleware } from "./auth";
import { createTableForModel } from "./dynamicTables"; // ⬅️ new import

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(authMiddleware as any);

const modelRegistry: Record<string, ModelDef> = {};

// Initialize models, create tables, register routes
async function initModels(app: express.Express) {
  const models = loadModels();
  for (const m of models) {
    modelRegistry[m.name] = m;

    // ⬅️ Create a real table in Postgres if it doesn’t exist
    try {
      await createTableForModel(m);
      console.log(`✅ Table ensured for ${m.name}`);
    } catch (err) {
      console.error(`❌ Failed to create table for ${m.name}:`, err);
    }

    registerModelRoutes(app, m);
    console.log("Registered routes for model", m.name);
  }
}

// Run async init before starting the server
(async () => {
  await initModels(app);

  // Admin: create model (in-memory until publish)
  app.post("/admin/models", async (req, res) => {
    const def = req.body as ModelDef;
    if (!def.name || !def.fields)
      return res.status(400).json({ error: "name and fields required" });
    const normalizedName = def.name.trim().toLowerCase();

    // ✅ Check for duplicates (case-insensitive)
  const exists = Object.keys(modelRegistry).some(
    (n) => n.trim().toLowerCase() === normalizedName
  );

  if (exists) {
    return res.status(409).json({ error: "Model with this name already exists" });
  }

  // ✅ Normalize tableName early (same rule used at publish time)
  def.tableName = normalizedName.replace(/\s+/g, "_");

    modelRegistry[def.name] = def;
    console.log(`🆕 Created new in-memory model: ${def.name}`);
    return res.json({ ok: true, model: def });
  });

  // Admin: publish model -> write file + register routes + persist ModelFile
  app.post("/admin/models/:name/publish", async (req, res) => {
    const name = req.params.name;
    const model = modelRegistry[name];
    if (!model) return res.status(404).json({ error: "Model not found" });
      // ✅ Normalize table name before writing or creating table
  model.tableName = (model.tableName || model.name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
    const path = writeModelFile(model);

    // ⬅️ Create the real table when model is published too
    try {
      await createTableForModel(model);
      console.log(`✅ Table ensured for ${model.name}`);
    } catch (err) {
      console.error(`❌ Failed to create table for ${model.name}:`, err);
    }

    registerModelRoutes(app, model);
    await prisma.modelFile.upsert({
      where: { name: model.name },
      update: { content: model, filePath: path },
      create: { name: model.name, content: model, filePath: path },
    });
    return res.json({ ok: true, path });
  });

  // List models
  app.get("/admin/models", (req, res) => {
    return res.json(Object.values(modelRegistry));
  });

  // Auth login (mock)
  app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid" });
    const token = generateToken({ id: user.id, role: user.role });
    return res.json({ token, user: { id: user.id, role: user.role, email: user.email } });
  });

  const PORT = process.env.PORT || 4000;
  await ensureSeedUsers();
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
})();
