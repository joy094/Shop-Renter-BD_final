import crypto from "crypto";

export function newId(prefix = ""): string {
  return prefix + crypto.randomBytes(8).toString("hex");
}

export function toDateStr(v: Date | string | null | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
  return v.toISOString().slice(0, 10);
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
