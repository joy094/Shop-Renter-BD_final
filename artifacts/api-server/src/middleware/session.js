import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const COOKIE = "rental_sess";
const MAX_AGE = 1000 * 60 * 60 * 24 * 7;

function sign(data) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function setSessionCookie(res, payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(data);
  res.cookie(COOKIE, `${data}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, { path: "/" });
}

export function readSession(req) {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return null;
  const [data, sig] = raw.split(".");
  if (!data || !sig) return null;
  if (sign(data) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  req.user = session;
  next();
}
