import { Router } from "express";
import { Payment } from "../models/Payment.js";
import { Shop } from "../models/Shop.js";
import { Tenant } from "../models/Tenant.js";
import { requireAuth } from "../lib/session.js";

const router = Router();
router.use(requireAuth);

function deriveStatus(p) {
  if (!p.amountPaid || p.amountPaid <= 0) return "unpaid";
  if (p.amountPaid >= p.amountDue) return "paid";
  return "partial";
}

async function enrich(payments) {
  const shopIds = [...new Set(payments.map((p) => p.shopId.toString()))];
  const tenantIds = [...new Set(payments.map((p) => p.tenantId.toString()))];
  const [shops, tenants] = await Promise.all([
    Shop.find({ _id: { $in: shopIds } }).lean(),
    Tenant.find({ _id: { $in: tenantIds } }).lean(),
  ]);
  const sMap = new Map(shops.map((s) => [s._id.toString(), s]));
  const tMap = new Map(tenants.map((t) => [t._id.toString(), t]));
  return payments.map((p) => ({
    ...p,
    shop: sMap.get(p.shopId.toString()) || null,
    tenant: tMap.get(p.tenantId.toString()) || null,
    status: deriveStatus(p),
  }));
}

router.get("/", async (req, res) => {
  const q = {};
  if (req.query.month) q.month = req.query.month;
  if (req.query.shopId) q.shopId = req.query.shopId;
  if (req.query.tenantId) q.tenantId = req.query.tenantId;
  const list = await Payment.find(q).sort({ month: -1, createdAt: -1 }).lean();
  let result = await enrich(list);
  if (req.query.status) {
    result = result.filter((p) => p.status === req.query.status);
  }
  res.json(result);
});

router.post("/", async (req, res) => {
  const shop = await Shop.findById(req.body.shopId);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  if (!shop.tenantId) return res.status(400).json({ error: "Shop has no tenant" });
  const p = await Payment.create({
    shopId: shop._id,
    tenantId: shop.tenantId,
    month: req.body.month,
    amountDue: req.body.amountDue ?? shop.monthlyRent,
    amountPaid: req.body.amountPaid ?? 0,
    paidOn: req.body.paidOn || null,
    method: req.body.method || null,
    note: req.body.note || null,
  });
  const [enriched] = await enrich([p.toObject()]);
  res.status(201).json(enriched);
});

router.put("/:id", async (req, res) => {
  const p = await Payment.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        amountDue: req.body.amountDue,
        amountPaid: req.body.amountPaid,
        paidOn: req.body.paidOn || null,
        method: req.body.method || null,
        note: req.body.note || null,
      },
    },
    { new: true }
  ).lean();
  if (!p) return res.status(404).json({ error: "Not found" });
  const [enriched] = await enrich([p]);
  res.json(enriched);
});

router.delete("/:id", async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post("/generate-monthly", async (req, res) => {
  const month = req.body?.month;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "month must be YYYY-MM" });
  }
  const shops = await Shop.find({ tenantId: { $ne: null } }).lean();
  let created = 0;
  for (const s of shops) {
    const exists = await Payment.findOne({ shopId: s._id, month });
    if (exists) continue;
    await Payment.create({
      shopId: s._id,
      tenantId: s.tenantId,
      month,
      amountDue: s.monthlyRent,
      amountPaid: 0,
    });
    created++;
  }
  res.json({ created, month });
});

export default router;
