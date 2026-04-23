import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SESSION_COOKIE = "rental_sess";
const SECRET = process.env["SESSION_SECRET"] || "dev-secret-change-me";

export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: string;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionCookie(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function readSession(req: Request): SessionPayload | null {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (!raw || typeof raw !== "string") return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, payload: SessionPayload) {
  const value = createSessionCookie(payload);
  res.cookie(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sess = readSession(req);
  if (!sess) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as Request & { session?: SessionPayload }).session = sess;
  next();
}
