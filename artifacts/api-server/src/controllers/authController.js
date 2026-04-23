import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { setSessionCookie, clearSessionCookie, readSession } from "../middleware/session.js";

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const payload = { id: user._id.toString(), username: user.username, name: user.name, role: user.role };
  setSessionCookie(res, payload);
  res.json({ authenticated: true, user: payload });
}

export function logout(_req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

export function me(req, res) {
  const session = readSession(req);
  if (!session) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: session });
}

export async function changePassword(req, res) {
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
}
