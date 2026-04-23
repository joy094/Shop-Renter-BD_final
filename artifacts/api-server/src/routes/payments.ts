import { Router, type IRouter } from "express";
import { db, paymentsTable, shopsTable, tenantsTable } from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import {
  CreatePaymentBody,
  UpdatePaymentBody,
  GenerateMonthlyPaymentsBody,
  ListPaymentsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { newId, toDateStr } from "../lib/ids";

const router: IRouter = Router();

router.use(requireAuth);

type PaymentRow = typeof paymentsTable.$inferSelect;

function status(due: number, paid: number): "paid" | "unpaid" | "partial" {
  if (paid <= 0) return "unpaid";
  if (paid >= due) return "paid";
  return "partial";
}

function shape(p: PaymentRow, shopCode: string, tenantName: string) {
  const due = Number(p.amountDue);
  const paid = Number(p.amountPaid);
  return {
    id: p.id,
    shopId: p.shopId,
    shopCode,
    tenantId: p.tenantId,
    tenantName,
    month: p.month,
    amountDue: due,
    amountPaid: paid,
    status: status(due, paid),
    paidOn: p.paidOn ?? undefined,
    method: p.method ?? undefined,
    note: p.note ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

async function enrich(payments: PaymentRow[]) {
  const shops = await db.select().from(shopsTable);
  const tenants = await db.select().from(tenantsTable);
  const sMap = new Map(shops.map((s) => [s.id, s.code]));
  const tMap = new Map(tenants.map((t) => [t.id, t.name]));
  return payments.map((p) =>
    shape(p, sMap.get(p.shopId) ?? "", tMap.get(p.tenantId) ?? ""),
  );
}

router.get("/payments", async (req, res) => {
  const parsed = ListPaymentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const filters = [];
  if (parsed.data.month) filters.push(eq(paymentsTable.month, parsed.data.month));
  if (parsed.data.tenantId) filters.push(eq(paymentsTable.tenantId, parsed.data.tenantId));
  if (parsed.data.shopId) filters.push(eq(paymentsTable.shopId, parsed.data.shopId));
  const where = filters.length > 0 ? and(...filters) : undefined;
  const rows = where
    ? await db.select().from(paymentsTable).where(where).orderBy(sql`${paymentsTable.month} desc`, sql`${paymentsTable.createdAt} desc`)
    : await db.select().from(paymentsTable).orderBy(sql`${paymentsTable.month} desc`, sql`${paymentsTable.createdAt} desc`);
  let enriched = await enrich(rows);
  if (parsed.data.status) {
    enriched = enriched.filter((p) => p.status === parsed.data.status);
  }
  res.json(enriched);
});

router.post("/payments", async (req, res) => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, parsed.data.shopId)).limit(1);
  if (!shop) {
    res.status(400).json({ error: "Shop not found" });
    return;
  }
  if (!shop.tenantId) {
    res.status(400).json({ error: "Shop has no tenant assigned" });
    return;
  }
  const id = newId("p_");
  const [row] = await db
    .insert(paymentsTable)
    .values({
      id,
      shopId: parsed.data.shopId,
      tenantId: shop.tenantId,
      month: parsed.data.month,
      amountDue: String(parsed.data.amountDue),
      amountPaid: String(parsed.data.amountPaid),
      paidOn: toDateStr(parsed.data.paidOn),
      method: parsed.data.method ?? null,
      note: parsed.data.note ?? null,
    })
    .returning();
  const enriched = await enrich([row]);
  res.status(201).json(enriched[0]);
});

router.put("/payments/:id", async (req, res) => {
  const parsed = UpdatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [row] = await db
    .update(paymentsTable)
    .set({
      shopId: parsed.data.shopId,
      month: parsed.data.month,
      amountDue: String(parsed.data.amountDue),
      amountPaid: String(parsed.data.amountPaid),
      paidOn: toDateStr(parsed.data.paidOn),
      method: parsed.data.method ?? null,
      note: parsed.data.note ?? null,
    })
    .where(eq(paymentsTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const enriched = await enrich([row]);
  res.json(enriched[0]);
});

router.delete("/payments/:id", async (req, res) => {
  await db.delete(paymentsTable).where(eq(paymentsTable.id, req.params.id));
  res.json({ ok: true });
});

router.post("/payments/generate", async (req, res) => {
  const parsed = GenerateMonthlyPaymentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const month = parsed.data.month;
  const shops = await db.select().from(shopsTable);
  const occupied = shops.filter((s) => s.tenantId);
  const created: PaymentRow[] = [];
  for (const shop of occupied) {
    const existing = await db
      .select()
      .from(paymentsTable)
      .where(and(eq(paymentsTable.shopId, shop.id), eq(paymentsTable.month, month)))
      .limit(1);
    if (existing.length > 0) continue;
    const [row] = await db
      .insert(paymentsTable)
      .values({
        id: newId("p_"),
        shopId: shop.id,
        tenantId: shop.tenantId!,
        month,
        amountDue: String(shop.monthlyRent),
        amountPaid: "0",
      })
      .returning();
    created.push(row);
  }
  const enriched = await enrich(created);
  res.json(enriched);
});

export default router;
