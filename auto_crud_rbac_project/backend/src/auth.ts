import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "./prismaClient";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export function generateToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  const token = auth.split(" ")[1];
  if (!token) return next();

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    (req as any).user = { id: payload.id, role: payload.role };
  } catch (e) {
    // ignore invalid token
  }
  next();
}

export async function ensureSeedUsers() {
  const u = await prisma.user.findFirst();
  if (!u) {
    await prisma.user.create({ data: { email: "admin@example.com", password: "pass", role: "Admin" } });
    await prisma.user.create({ data: { email: "manager@example.com", password: "pass", role: "Manager" } });
    await prisma.user.create({ data: { email: "viewer@example.com", password: "pass", role: "Viewer" } });
    console.log("Seeded users: admin/manager/viewer (password: pass)");
  }
}


export function mockAuth(req: Request, res: Response, next: NextFunction) {
  // Simulate logged-in Admin user
  (req as any).user = { id: "1", role: "Admin" };
  next();
}