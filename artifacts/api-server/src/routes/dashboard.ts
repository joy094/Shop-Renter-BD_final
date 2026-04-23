import { Router, type IRouter } from "express";
import { db, paymentsTable, shopsTable, tenantsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

router.use(requireAuth);

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

router.get("/dashboard/summary", async (_req, res) => {
  const shops = await db.select().from(shopsTable);
  const tenants = await db.select().from(tenantsTable);
  const month = currentMonth();
  const monthPayments = await db.select().from(paymentsTable).where(eq(paymentsTable.month, month));

  const occupied = shops.filter((s) => s.tenantId).length;
  const expected = monthPayments.reduce((acc, p) => acc + Number(p.amountDue), 0);
  const collected = monthPayments.reduce((acc, p) => acc + Number(p.amountPaid), 0);
  const paidCount = monthPayments.filter((p) => Number(p.amountPaid) >= Number(p.amountDue) && Number(p.amountPaid) > 0).length;
  const unpaidCount = monthPayments.filter((p) => Number(p.amountPaid) < Number(p.amountDue)).length;

  res.json({
    totalShops: shops.length,
    occupiedShops: occupied,
    vacantShops: shops.length - occupied,
    totalTenants: tenants.length,
    currentMonth: month,
    expectedThisMonth: expected,
    collectedThisMonth: collected,
    outstandingThisMonth: Math.max(0, expected - collected),
    paidCount,
    unpaidCount,
  });
});

router.get("/dashboard/recent-payments", async (_req, res) => {
  const rows = await db
    .select()
    .from(paymentsTable)
    .orderBy(desc(paymentsTable.createdAt))
    .limit(10);
  const shops = await db.select().from(shopsTable);
  const tenants = await db.select().from(tenantsTable);
  const sMap = new Map(shops.map((s) => [s.id, s.code]));
  const tMap = new Map(tenants.map((t) => [t.id, t.name]));
  res.json(
    rows.map((p) => {
      const due = Number(p.amountDue);
      const paid = Number(p.amountPaid);
      return {
        id: p.id,
        shopId: p.shopId,
        shopCode: sMap.get(p.shopId) ?? "",
        tenantId: p.tenantId,
        tenantName: tMap.get(p.tenantId) ?? "",
        month: p.month,
        amountDue: due,
        amountPaid: paid,
        status: paid <= 0 ? "unpaid" : paid >= due ? "paid" : "partial",
        paidOn: p.paidOn ?? undefined,
        method: p.method ?? undefined,
        note: p.note ?? undefined,
        createdAt: p.createdAt.toISOString(),
      };
    }),
  );
});

router.get("/dashboard/due-reminders", async (_req, res) => {
  const month = currentMonth();
  const now = new Date();
  const rows = await db.select().from(paymentsTable);
  const shops = await db.select().from(shopsTable);
  const tenants = await db.select().from(tenantsTable);
  const sMap = new Map(shops.map((s) => [s.id, s.code]));
  const tMap = new Map(tenants.map((t) => [t.id, t]));

  const reminders = rows
    .filter((p) => Number(p.amountPaid) < Number(p.amountDue))
    .map((p) => {
      const [y, m] = p.month.split("-").map(Number);
      const dueDate = new Date(y, m - 1, 7);
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const tenant = tMap.get(p.tenantId);
      return {
        paymentId: p.id,
        shopCode: sMap.get(p.shopId) ?? "",
        tenantName: tenant?.name ?? "",
        tenantPhone: tenant?.phone ?? "",
        month: p.month,
        amountDue: Number(p.amountDue),
        amountPaid: Number(p.amountPaid),
        daysOverdue,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 20);

  res.json(reminders);
});

export default router;
