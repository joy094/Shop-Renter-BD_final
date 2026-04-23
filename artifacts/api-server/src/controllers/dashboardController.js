import { Shop } from "../models/Shop.js";
import { Tenant } from "../models/Tenant.js";
import { Payment } from "../models/Payment.js";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function summary(_req, res) {
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
}

async function attachShopAndTenant(rows) {
  const tenantIds = rows.map((p) => p.tenantId);
  const shopIds = rows.map((p) => p.shopId);
  const [tenants, shops] = await Promise.all([
    Tenant.find({ _id: { $in: tenantIds } }).lean(),
    Shop.find({ _id: { $in: shopIds } }).lean(),
  ]);
  const tMap = new Map(tenants.map((t) => [t._id.toString(), t]));
  const sMap = new Map(shops.map((s) => [s._id.toString(), s]));
  return rows.map((p) => ({
    ...p,
    tenant: tMap.get(p.tenantId.toString()) || null,
    shop: sMap.get(p.shopId.toString()) || null,
  }));
}

export async function recentPayments(_req, res) {
  const list = await Payment.find({ amountPaid: { $gt: 0 } })
    .sort({ paidOn: -1, updatedAt: -1 })
    .limit(8)
    .lean();
  res.json(await attachShopAndTenant(list));
}

export async function reminders(_req, res) {
  const month = currentMonth();
  const due = await Payment.find({ month, $expr: { $lt: ["$amountPaid", "$amountDue"] } }).lean();
  const enriched = await attachShopAndTenant(due);
  res.json(enriched.map((p) => ({ ...p, outstanding: (p.amountDue || 0) - (p.amountPaid || 0) })));
}
