import { Payment } from "../models/Payment.js";
import { Shop } from "../models/Shop.js";
import { Tenant } from "../models/Tenant.js";

export async function monthlyCollection(req, res) {
  const months = parseInt(req.query.months || "12", 10);
  const now = new Date();
  const monthList = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const payments = await Payment.find({ month: { $in: monthList } }).lean();
  const grouped = new Map(monthList.map((m) => [m, { month: m, expected: 0, collected: 0 }]));
  for (const p of payments) {
    const g = grouped.get(p.month);
    if (!g) continue;
    g.expected += p.amountDue || 0;
    g.collected += p.amountPaid || 0;
  }
  res.json(Array.from(grouped.values()));
}

export async function occupancy(_req, res) {
  const [total, occupied] = await Promise.all([
    Shop.countDocuments(),
    Shop.countDocuments({ tenantId: { $ne: null } }),
  ]);
  res.json({ occupied, vacant: total - occupied, total });
}

export async function topTenants(req, res) {
  const limit = parseInt(req.query.limit || "5", 10);
  const agg = await Payment.aggregate([
    { $group: { _id: "$tenantId", totalPaid: { $sum: "$amountPaid" }, totalDue: { $sum: "$amountDue" } } },
    { $sort: { totalPaid: -1 } },
    { $limit: limit },
  ]);
  const tenants = await Tenant.find({ _id: { $in: agg.map((a) => a._id) } }).lean();
  const map = new Map(tenants.map((t) => [t._id.toString(), t]));
  res.json(
    agg.map((a) => ({
      tenant: map.get(a._id.toString()) || null,
      totalPaid: a.totalPaid,
      totalDue: a.totalDue,
    }))
  );
}
