import { Router } from "express";
import { Shop } from "../models/Shop.js";
import { Tenant } from "../models/Tenant.js";
import { Payment } from "../models/Payment.js";
import { requireAuth } from "../lib/session.js";

const router = Router();
router.use(requireAuth);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function enrich(shops) {
  const month = currentMonth();
  const tenantIds = shops.map((s) => s.tenantId).filter(Boolean);
  const tenants = await Tenant.find({ _id: { $in: tenantIds } }).lean();
  const tenantMap = new Map(tenants.map((t) => [t._id.toString(), t]));
  const shopIds = shops.map((s) => s._id);
  const payments = await Payment.find({ shopId: { $in: shopIds }, month }).lean();
  const payMap = new Map(payments.map((p) => [p.shopId.toString(), p]));

  return shops.map((s) => {
    let status = "vacant";
    if (s.tenantId) {
      const p = payMap.get(s._id.toString());
      if (!p || p.amountPaid <= 0) status = "unpaid";
      else if (p.amountPaid >= p.amountDue) status = "paid";
      else status = "partial";
    }
    return {
      ...s,
      tenant: s.tenantId ? tenantMap.get(s.tenantId.toString()) || null : null,
      currentStatus: status,
    };
  });
}

router.get("/", async (_req, res) => {
  const shops = await Shop.find().sort({ code: 1 }).lean();
  res.json(await enrich(shops));
});

router.post("/", async (req, res) => {
  const s = await Shop.create(req.body);
  const [enriched] = await enrich([s.toObject()]);
  res.status(201).json(enriched);
});

router.get("/:id", async (req, res) => {
  const s = await Shop.findById(req.params.id).lean();
  if (!s) return res.status(404).json({ error: "Not found" });
  const [enriched] = await enrich([s]);
  res.json(enriched);
});

router.put("/:id", async (req, res) => {
  const s = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
  if (!s) return res.status(404).json({ error: "Not found" });
  const [enriched] = await enrich([s]);
  res.json(enriched);
});

router.delete("/:id", async (req, res) => {
  await Payment.deleteMany({ shopId: req.params.id });
  await Shop.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post("/:id/assign-tenant", async (req, res) => {
  const { tenantId, leaseStart } = req.body || {};
  const s = await Shop.findByIdAndUpdate(
    req.params.id,
    { tenantId: tenantId || null, leaseStart: leaseStart || null },
    { new: true }
  ).lean();
  if (!s) return res.status(404).json({ error: "Not found" });
  const [enriched] = await enrich([s]);
  res.json(enriched);
});

export default router;
