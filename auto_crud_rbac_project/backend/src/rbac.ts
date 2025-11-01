import { Request, Response, NextFunction } from "express";
import { ModelDef } from "./modelsLoader";

export type AuthUser = { id: string; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function hasPermission(rolePerms: string[], action: string) {
  if (rolePerms.includes("all")) return true;
  return rolePerms.includes(action);
}

export function rbacMiddleware(model: ModelDef, action: "create" | "read" | "update" | "delete") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const role = user.role || "Viewer";
    const perms = model.rbac?.[role] || [];

    if (role === "Admin") return next();

    if (!hasPermission(perms, action)) {
      return res.status(403).json({ error: "Forbidden: insufficient permission" });
    }

    if ((action === "update" || action === "delete") && model.ownerField) {
      (req as any).rbacOwnerCheckRequired = true;
      (req as any).ownerFieldName = model.ownerField;
    }

    return next();
  };
}
