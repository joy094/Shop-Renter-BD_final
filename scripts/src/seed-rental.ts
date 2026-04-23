import crypto from "crypto";
import { db, usersTable, tenantsTable, shopsTable, paymentsTable } from "@workspace/db";

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}
function id(prefix: string) {
  return prefix + crypto.randomBytes(6).toString("hex");
}

async function main() {
  await db.delete(paymentsTable);
  await db.delete(shopsTable);
  await db.delete(tenantsTable);
  await db.delete(usersTable);

  await db.insert(usersTable).values({
    id: id("u_"),
    username: "admin",
    passwordHash: hash("admin123"),
    name: "Md. Karim Uddin",
    role: "admin",
  });

  const tenants = [
    { id: id("t_"), name: "Mohammad Rahim", phone: "+8801711-123456", nidNumber: "1990123456789", address: "House 12, Road 5, Dhanmondi, Dhaka", email: "rahim@example.com", notes: "Tea stall owner — pays on time" },
    { id: id("t_"), name: "Abdul Karim Sarker", phone: "+8801912-654321", nidNumber: "1985987654321", address: "23/A Bashundhara R/A, Dhaka", email: null as string | null, notes: "Electronics shop" },
    { id: id("t_"), name: "Salma Begum", phone: "+8801818-555444", nidNumber: "1992555444333", address: "Block C, Mirpur 10, Dhaka", email: "salma.begum@example.com", notes: "Tailoring shop" },
    { id: id("t_"), name: "Jahangir Alam", phone: "+8801555-777888", nidNumber: null as string | null, address: "Pahartali, Chittagong", email: null as string | null, notes: "Mobile accessories" },
    { id: id("t_"), name: "Rezaul Islam", phone: "+8801711-999000", nidNumber: "1988111222333", address: "Newmarket area, Dhaka", email: null as string | null, notes: null as string | null },
    { id: id("t_"), name: "Fatema Khatun", phone: "+8801911-444555", nidNumber: "1995444555666", address: "Uttara Sector 7, Dhaka", email: "fatema.k@example.com", notes: "Cosmetics shop" },
  ];
  await db.insert(tenantsTable).values(tenants);

  const shops = [
    { id: id("s_"), code: "A-01", location: "Ground Floor, North Wing", sizeSqft: "120", monthlyRent: "8500", depositAmount: "25000", tenantId: tenants[0].id, leaseStart: "2024-01-15", notes: "Corner shop" },
    { id: id("s_"), code: "A-02", location: "Ground Floor, North Wing", sizeSqft: "100", monthlyRent: "7500", depositAmount: "20000", tenantId: tenants[1].id, leaseStart: "2023-08-01", notes: null as string | null },
    { id: id("s_"), code: "A-03", location: "Ground Floor, North Wing", sizeSqft: "100", monthlyRent: "7500", depositAmount: "20000", tenantId: null as string | null, leaseStart: null as string | null, notes: "Available from this month" },
    { id: id("s_"), code: "B-01", location: "First Floor, East Wing", sizeSqft: "150", monthlyRent: "12000", depositAmount: "35000", tenantId: tenants[2].id, leaseStart: "2024-03-10", notes: null as string | null },
    { id: id("s_"), code: "B-02", location: "First Floor, East Wing", sizeSqft: "140", monthlyRent: "11000", depositAmount: "30000", tenantId: tenants[3].id, leaseStart: "2025-02-01", notes: null as string | null },
    { id: id("s_"), code: "B-03", location: "First Floor, East Wing", sizeSqft: "140", monthlyRent: "11000", depositAmount: "30000", tenantId: tenants[4].id, leaseStart: "2024-11-01", notes: null as string | null },
    { id: id("s_"), code: "C-01", location: "Second Floor, South Wing", sizeSqft: "180", monthlyRent: "15000", depositAmount: "45000", tenantId: tenants[5].id, leaseStart: "2025-06-01", notes: "Large unit with attached storage" },
    { id: id("s_"), code: "C-02", location: "Second Floor, South Wing", sizeSqft: "180", monthlyRent: "15000", depositAmount: "45000", tenantId: null as string | null, leaseStart: null as string | null, notes: null as string | null },
  ];
  await db.insert(shopsTable).values(shops);

  // Generate 12 months of payments for each occupied shop
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const occupied = shops.filter((s) => s.tenantId);
  const payments: Array<typeof paymentsTable.$inferInsert> = [];
  const methods = ["cash", "bkash", "nagad", "rocket", "bank"];
  for (const s of occupied) {
    months.forEach((m, idx) => {
      const isCurrent = idx === months.length - 1;
      const isPrev = idx === months.length - 2;
      const due = Number(s.monthlyRent);
      let paid = due;
      let paidOn: string | null = `${m}-05`;
      let method: string | null = methods[(idx + s.code.charCodeAt(0)) % methods.length];

      if (isCurrent) {
        // Mix of unpaid / partial / paid
        const r = (s.code.charCodeAt(0) + s.code.charCodeAt(2)) % 3;
        if (r === 0) {
          paid = 0;
          paidOn = null;
          method = null;
        } else if (r === 1) {
          paid = Math.round(due * 0.5);
          paidOn = `${m}-08`;
        }
      } else if (isPrev) {
        // Some unpaid in previous month for overdue reminders
        const r = (s.code.charCodeAt(0) + 1) % 4;
        if (r === 0) {
          paid = 0;
          paidOn = null;
          method = null;
        }
      }
      payments.push({
        id: id("p_"),
        shopId: s.id,
        tenantId: s.tenantId!,
        month: m,
        amountDue: String(due),
        amountPaid: String(paid),
        paidOn,
        method,
        note: null,
      });
    });
  }
  await db.insert(paymentsTable).values(payments);

  console.log(`Seeded ${tenants.length} tenants, ${shops.length} shops, ${payments.length} payments`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
