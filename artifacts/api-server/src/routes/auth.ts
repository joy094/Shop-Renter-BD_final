import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import { setSessionCookie, clearSessionCookie, readSession } from "../lib/session";

const router: IRouter = Router();

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password } = parsed.data;
  const rows = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  const user = rows[0];
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  setSessionCookie(res, {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  res.json({
    authenticated: true,
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
  });
});

router.post("/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/auth/me", (req, res) => {
  const sess = readSession(req);
  if (!sess) {
    res.json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    user: { id: sess.userId, name: sess.name, username: sess.username, role: sess.role },
  });
});

export default router;
export { hashPassword };
