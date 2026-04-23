import { Router, type IRouter } from "express";
import { db, paymentsTable, shopsTable, tenantsTable } from "@workspace/db";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/reports/monthly-collection", async (_req, res) => {
  const payments = await db.select().from(paymentsTable);
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const data = months.map((m) => {
    const ps = payments.filter((p) => p.month === m);
    return {
      month: m,
      expected: ps.reduce((a, p) => a + Number(p.amountDue), 0),
      collected: ps.reduce((a, p) => a + Number(p.amountPaid), 0),
    };
  });
  res.json(data);
});

router.get("/reports/shop-occupancy", async (_req, res) => {
  const shops = await db.select().from(shopsTable);
  const occupied = shops.filter((s) => s.tenantId).length;
  res.json({ occupied, vacant: shops.length - occupied });
});

router.get("/reports/top-tenants", async (_req, res) => {
  const payments = await db.select().from(paymentsTable);
  const tenants = await db.select().from(tenantsTable);
  const year = new Date().getFullYear();
  const totals = new Map<string, number>();
  for (const p of payments) {
    if (!p.month.startsWith(String(year))) continue;
    totals.set(p.tenantId, (totals.get(p.tenantId) ?? 0) + Number(p.amountPaid));
  }
  const result = tenants
    .map((t) => ({ tenantId: t.id, tenantName: t.name, totalPaid: totals.get(t.id) ?? 0 }))
    .filter((t) => t.totalPaid > 0)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);
  res.json(result);
});

export default router;
