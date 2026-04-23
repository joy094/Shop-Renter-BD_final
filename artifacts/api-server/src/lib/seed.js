import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Tenant } from "../models/Tenant.js";
import { Shop } from "../models/Shop.js";
import { Payment } from "../models/Payment.js";

export async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log("DB already seeded, skipping");
    return;
  }

  console.log("Seeding initial data...");

  await User.create({
    username: "admin",
    passwordHash: await bcrypt.hash("admin123", 10),
    name: "Md. Karim Uddin",
    role: "admin",
  });

  const tenants = await Tenant.insertMany([
    { name: "Mohammad Rahim", phone: "+8801711-123456", nidNumber: "1990123456789", address: "House 12, Road 5, Dhanmondi, Dhaka", email: "rahim@example.com", notes: "Tea stall owner — pays on time" },
    { name: "Abdul Karim Sarker", phone: "+8801912-654321", nidNumber: "1985987654321", address: "23/A Bashundhara R/A, Dhaka", notes: "Electronics shop" },
    { name: "Salma Begum", phone: "+8801818-555444", nidNumber: "1992555444333", address: "Block C, Mirpur 10, Dhaka", email: "salma.begum@example.com", notes: "Tailoring shop" },
    { name: "Jahangir Alam", phone: "+8801555-777888", address: "Pahartali, Chittagong", notes: "Mobile accessories" },
    { name: "Rezaul Islam", phone: "+8801711-999000", nidNumber: "1988111222333", address: "Newmarket area, Dhaka" },
    { name: "Fatema Khatun", phone: "+8801911-444555", nidNumber: "1995444555666", address: "Uttara Sector 7, Dhaka", email: "fatema.k@example.com", notes: "Cosmetics shop" },
  ]);

  const shops = await Shop.insertMany([
    { code: "A-01", location: "Ground Floor, North Wing", sizeSqft: 120, monthlyRent: 8500, depositAmount: 25000, tenantId: tenants[0]._id, leaseStart: "2024-01-15", notes: "Corner shop" },
    { code: "A-02", location: "Ground Floor, North Wing", sizeSqft: 100, monthlyRent: 7500, depositAmount: 20000, tenantId: tenants[1]._id, leaseStart: "2023-08-01" },
    { code: "A-03", location: "Ground Floor, North Wing", sizeSqft: 100, monthlyRent: 7500, depositAmount: 20000, tenantId: null, notes: "Available from this month" },
    { code: "B-01", location: "First Floor, East Wing", sizeSqft: 150, monthlyRent: 12000, depositAmount: 35000, tenantId: tenants[2]._id, leaseStart: "2024-03-10" },
    { code: "B-02", location: "First Floor, East Wing", sizeSqft: 140, monthlyRent: 11000, depositAmount: 30000, tenantId: tenants[3]._id, leaseStart: "2025-02-01" },
    { code: "B-03", location: "First Floor, East Wing", sizeSqft: 140, monthlyRent: 11000, depositAmount: 30000, tenantId: tenants[4]._id, leaseStart: "2024-11-01" },
    { code: "C-01", location: "Second Floor, South Wing", sizeSqft: 180, monthlyRent: 15000, depositAmount: 45000, tenantId: tenants[5]._id, leaseStart: "2025-06-01", notes: "Large unit with attached storage" },
    { code: "C-02", location: "Second Floor, South Wing", sizeSqft: 180, monthlyRent: 15000, depositAmount: 45000, tenantId: null },
  ]);

  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const occupied = shops.filter((s) => s.tenantId);
  const methods = ["cash", "bkash", "nagad", "rocket", "bank"];
  const payments = [];
  for (const s of occupied) {
    months.forEach((m, idx) => {
      const isCurrent = idx === months.length - 1;
      const isPrev = idx === months.length - 2;
      const due = s.monthlyRent;
      let paid = due;
      let paidOn = `${m}-05`;
      let method = methods[(idx + s.code.charCodeAt(0)) % methods.length];

      if (isCurrent) {
        const r = (s.code.charCodeAt(0) + s.code.charCodeAt(2)) % 3;
        if (r === 0) { paid = 0; paidOn = null; method = null; }
        else if (r === 1) { paid = Math.round(due * 0.5); paidOn = `${m}-08`; }
      } else if (isPrev) {
        const r = (s.code.charCodeAt(0) + 1) % 4;
        if (r === 0) { paid = 0; paidOn = null; method = null; }
      }
      payments.push({
        shopId: s._id,
        tenantId: s.tenantId,
        month: m,
        amountDue: due,
        amountPaid: paid,
        paidOn,
        method,
      });
    });
  }
  await Payment.insertMany(payments);
  console.log(`Seeded: ${tenants.length} tenants, ${shops.length} shops, ${payments.length} payments`);
}
