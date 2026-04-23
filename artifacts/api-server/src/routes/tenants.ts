import { Router, type IRouter } from "express";
import { db, tenantsTable, shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTenantBody, UpdateTenantBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/session";
import { newId } from "../lib/ids";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/tenants", async (_req, res) => {
  const rows = await db.select().from(tenantsTable).orderBy(tenantsTable.name);
  res.json(rows);
});

router.post("/tenants", async (req, res) => {
  const parsed = CreateTenantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const id = newId("t_");
  const [row] = await db.insert(tenantsTable).values({ id, ...parsed.data }).returning();
  res.status(201).json(row);
});

router.get("/tenants/:id", async (req, res) => {
  const [row] = await db.select().from(tenantsTable).where(eq(tenantsTable.id, req.params.id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.put("/tenants/:id", async (req, res) => {
  const parsed = UpdateTenantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [row] = await db
    .update(tenantsTable)
    .set(parsed.data)
    .where(eq(tenantsTable.id, req.params.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(row);
});

router.delete("/tenants/:id", async (req, res) => {
  await db.update(shopsTable).set({ tenantId: null }).where(eq(shopsTable.tenantId, req.params.id));
  await db.delete(tenantsTable).where(eq(tenantsTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
