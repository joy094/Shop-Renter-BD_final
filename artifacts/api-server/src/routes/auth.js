import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { setSessionCookie, clearSessionCookie, readSession, requireAuth } from "../lib/session.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  setSessionCookie(res, { id: user._id.toString(), username: user.username, name: user.name, role: user.role });
  res.json({
    authenticated: true,
    user: { id: user._id, username: user.username, name: user.name, role: user.role },
  });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const session = readSession(req);
  if (!session) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: session });
});

router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both passwords required" });
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ ok: true });
});

export default router;
