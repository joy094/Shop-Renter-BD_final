import { Router, type IRouter } from "express";
import { db, shopsTable, tenantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateShopBody, UpdateShopBody, AssignTenantToShopBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { newId, toDateStr } from "../lib/ids";

const router: IRouter = Router();

router.use(requireAuth);

type ShopRow = typeof shopsTable.$inferSelect;
type TenantRow = typeof tenantsTable.$inferSelect;

function shape(shop: ShopRow, tenant?: TenantRow | null) {
  return {
    id: shop.id,
    code: shop.code,
    location: shop.location,
    sizeSqft: shop.sizeSqft != null ? Number(shop.sizeSqft) : undefined,
    monthlyRent: Number(shop.monthlyRent),
    depositAmount: shop.depositAmount != null ? Number(shop.depositAmount) : undefined,
    status: shop.tenantId ? "occupied" : "vacant",
    tenantId: shop.tenantId ?? undefined,
    tenantName: tenant?.name ?? undefined,
    leaseStart: shop.leaseStart ?? undefined,
    notes: shop.notes ?? undefined,
    createdAt: shop.createdAt.toISOString(),
  };
}

router.get("/shops", async (_req, res) => {
  const shops = await db.select().from(shopsTable).orderBy(shopsTable.code);
  const tenants = await db.select().from(tenantsTable);
  const tMap = new Map(tenants.map((t) => [t.id, t]));
  res.json(shops.map((s) => shape(s, s.tenantId ? tMap.get(s.tenantId) : null)));
});

router.post("/shops", async (req, res) => {
  const parsed = CreateShopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const id = newId("s_");
  const [row] = await db
    .insert(shopsTable)
    .values({
      id,
      code: parsed.data.code,
      location: parsed.data.location,
      sizeSqft: parsed.data.sizeSqft != null ? String(parsed.data.sizeSqft) : null,
      monthlyRent: String(parsed.data.monthlyRent),
      depositAmount: parsed.data.depositAmount != null ? String(parsed.data.depositAmount) : null,
      notes: parsed.data.notes ?? null,
    })
    .returning();
  res.status(201).json(shape(row, null));
});

router.get("/shops/:id", async (req, res) => {
  const [shop] = await db.select().from(shopsTable).where(eq(shopsTable.id, req.params.id)).limit(1);
  if (!shop) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const tenant = shop.tenantId
    ? (await db.select().from(tenantsTable).where(eq(tenantsTable.id, shop.tenantId)).limit(1))[0]
    : null;
  res.json(shape(shop, tenant));
});

router.put("/shops/:id", async (req, res) => {
  const parsed = UpdateShopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [row] = await db
    .update(shopsTable)
    .set({
      code: parsed.data.code,
      location: parsed.data.location,
      sizeSqft: parsed.data.sizeSqft != null ? String(parsed.data.sizeSqft) : null,
      monthlyRent: String(parsed.data.monthlyRent),
      depositAmount: parsed.data.depositAmount != null ? String(parsed.data.depositAmount) : null,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(shopsTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const tenant = row.tenantId
    ? (await db.select().from(tenantsTable).where(eq(tenantsTable.id, row.tenantId)).limit(1))[0]
    : null;
  res.json(shape(row, tenant));
});

router.delete("/shops/:id", async (req, res) => {
  await db.delete(shopsTable).where(eq(shopsTable.id, req.params.id));
  res.json({ ok: true });
});

router.post("/shops/:id/assign", async (req, res) => {
  const parsed = AssignTenantToShopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const tenantId = parsed.data.tenantId ?? null;
  const [row] = await db
    .update(shopsTable)
    .set({
      tenantId,
      leaseStart: toDateStr(parsed.data.leaseStart),
    })
    .where(eq(shopsTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const tenant = row.tenantId
    ? (await db.select().from(tenantsTable).where(eq(tenantsTable.id, row.tenantId)).limit(1))[0]
    : null;
  res.json(shape(row, tenant));
});

export default router;
