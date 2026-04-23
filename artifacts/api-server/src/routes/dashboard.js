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

router.get("/summary", async (_req, res) => {
  const month = currentMonth();
  const [totalShops, totalTenants, occupiedShops, payments] = await Promise.all([
    Shop.countDocuments(),
    Tenant.countDocuments(),
    Shop.countDocuments({ tenantId: { $ne: null } }),
    Payment.find({ month }).lean(),
  ]);
  const expected = payments.reduce((s, p) => s + (p.amountDue || 0), 0);
  const collected = payments.reduce((s, p) => s + (p.amountPaid || 0), 0);
  const paidCount = payments.filter((p) => p.amountPaid >= p.amountDue).length;
  const unpaidCount = payments.filter((p) => !p.amountPaid || p.amountPaid <= 0).length;
  res.json({
    totalShops,
    occupiedShops,
    vacantShops: totalShops - occupiedShops,
    totalTenants,
    currentMonth: month,
    expectedThisMonth: expected,
    collectedThisMonth: collected,
    outstandingThisMonth: expected - collected,
    paidCount,
    unpaidCount,
  });
});

router.get("/recent-payments", async (_req, res) => {
  const list = await Payment.find({ amountPaid: { $gt: 0 } })
    .sort({ paidOn: -1, updatedAt: -1 })
    .limit(8)
    .lean();
  const tenantIds = list.map((p) => p.tenantId);
  const shopIds = list.map((p) => p.shopId);
  const [tenants, shops] = await Promise.all([
    Tenant.find({ _id: { $in: tenantIds } }).lean(),
    Shop.find({ _id: { $in: shopIds } }).lean(),
  ]);
  const tMap = new Map(tenants.map((t) => [t._id.toString(), t]));
  const sMap = new Map(shops.map((s) => [s._id.toString(), s]));
  res.json(
    list.map((p) => ({
      ...p,
      tenant: tMap.get(p.tenantId.toString()) || null,
      shop: sMap.get(p.shopId.toString()) || null,
    }))
  );
});

router.get("/reminders", async (_req, res) => {
  const month = currentMonth();
  const due = await Payment.find({ month, $expr: { $lt: ["$amountPaid", "$amountDue"] } }).lean();
  const tenantIds = due.map((p) => p.tenantId);
  const shopIds = due.map((p) => p.shopId);
  const [tenants, shops] = await Promise.all([
    Tenant.find({ _id: { $in: tenantIds } }).lean(),
    Shop.find({ _id: { $in: shopIds } }).lean(),
  ]);
  const tMap = new Map(tenants.map((t) => [t._id.toString(), t]));
  const sMap = new Map(shops.map((s) => [s._id.toString(), s]));
  res.json(
    due.map((p) => ({
      ...p,
      tenant: tMap.get(p.tenantId.toString()) || null,
      shop: sMap.get(p.shopId.toString()) || null,
      outstanding: (p.amountDue || 0) - (p.amountPaid || 0),
    }))
  );
});

export default router;
