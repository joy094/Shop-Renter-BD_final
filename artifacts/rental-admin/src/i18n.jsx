import { createContext, useContext, useState, useEffect } from "react";

const dict = {
  appName: { en: "Dokan Bhara", bn: "দোকান ভাড়া" },
  appTagline: { en: "Shop Rental Management", bn: "দোকান ভাড়া ব্যবস্থাপনা" },
  dashboard: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  tenants: { en: "Tenants", bn: "ভাড়াটিয়া" },
  shops: { en: "Shops", bn: "দোকান" },
  payments: { en: "Payments", bn: "পেমেন্ট" },
  reports: { en: "Reports", bn: "রিপোর্ট" },
  settings: { en: "Settings", bn: "সেটিংস" },
  logout: { en: "Logout", bn: "লগআউট" },
  login: { en: "Login", bn: "লগইন" },
  username: { en: "Username", bn: "ইউজারনেম" },
  password: { en: "Password", bn: "পাসওয়ার্ড" },
  totalShops: { en: "Total Shops", bn: "মোট দোকান" },
  occupied: { en: "Occupied", bn: "ভাড়া দেওয়া" },
  vacant: { en: "Vacant", bn: "খালি" },
  totalTenants: { en: "Total Tenants", bn: "মোট ভাড়াটিয়া" },
  expectedThisMonth: { en: "Expected this month", bn: "এই মাসের প্রত্যাশিত" },
  collectedThisMonth: { en: "Collected this month", bn: "এই মাসে আদায়" },
  outstanding: { en: "Outstanding", bn: "বকেয়া" },
  recentPayments: { en: "Recent Payments", bn: "সাম্প্রতিক পেমেন্ট" },
  reminders: { en: "Due Reminders", bn: "বকেয়া স্মরণিকা" },
  name: { en: "Name", bn: "নাম" },
  phone: { en: "Phone", bn: "ফোন" },
  nid: { en: "NID Number", bn: "এনআইডি নম্বর" },
  address: { en: "Address", bn: "ঠিকানা" },
  email: { en: "Email", bn: "ইমেইল" },
  notes: { en: "Notes", bn: "মন্তব্য" },
  add: { en: "Add", bn: "যোগ করুন" },
  edit: { en: "Edit", bn: "সম্পাদনা" },
  delete: { en: "Delete", bn: "মুছুন" },
  save: { en: "Save", bn: "সংরক্ষণ" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  search: { en: "Search...", bn: "অনুসন্ধান..." },
  newTenant: { en: "New Tenant", bn: "নতুন ভাড়াটিয়া" },
  editTenant: { en: "Edit Tenant", bn: "ভাড়াটিয়া সম্পাদনা" },
  newShop: { en: "New Shop", bn: "নতুন দোকান" },
  editShop: { en: "Edit Shop", bn: "দোকান সম্পাদনা" },
  shopCode: { en: "Shop Code", bn: "দোকান কোড" },
  location: { en: "Location", bn: "অবস্থান" },
  size: { en: "Size (sqft)", bn: "আকার (বর্গফুট)" },
  monthlyRent: { en: "Monthly Rent", bn: "মাসিক ভাড়া" },
  deposit: { en: "Deposit", bn: "জামানত" },
  tenant: { en: "Tenant", bn: "ভাড়াটিয়া" },
  status: { en: "Status", bn: "অবস্থা" },
  paid: { en: "Paid", bn: "পরিশোধিত" },
  unpaid: { en: "Unpaid", bn: "অপরিশোধিত" },
  partial: { en: "Partial", bn: "আংশিক" },
  month: { en: "Month", bn: "মাস" },
  amountDue: { en: "Amount Due", bn: "প্রাপ্য" },
  amountPaid: { en: "Amount Paid", bn: "পরিশোধিত" },
  paidOn: { en: "Paid On", bn: "পরিশোধের তারিখ" },
  method: { en: "Method", bn: "মাধ্যম" },
  recordPayment: { en: "Record Payment", bn: "পেমেন্ট রেকর্ড" },
  generateMonthly: { en: "Generate Monthly Bills", bn: "মাসিক বিল তৈরি করুন" },
  filterMonth: { en: "Filter by month", bn: "মাস অনুযায়ী ফিল্টার" },
  filterStatus: { en: "All status", bn: "সকল অবস্থা" },
  monthlyCollection: { en: "Monthly Collection", bn: "মাসিক আদায়" },
  occupancyChart: { en: "Occupancy", bn: "ভাড়া হার" },
  topTenants: { en: "Top Tenants by Total Paid", bn: "সর্বোচ্চ পরিশোধকারী ভাড়াটিয়া" },
  language: { en: "Language", bn: "ভাষা" },
  changePassword: { en: "Change Password", bn: "পাসওয়ার্ড পরিবর্তন" },
  currentPassword: { en: "Current Password", bn: "বর্তমান পাসওয়ার্ড" },
  newPassword: { en: "New Password", bn: "নতুন পাসওয়ার্ড" },
  noData: { en: "No data yet", bn: "এখনো কোনো তথ্য নেই" },
  assignTenant: { en: "Assign Tenant", bn: "ভাড়াটিয়া নিযুক্ত করুন" },
  selectTenant: { en: "-- Select tenant --", bn: "-- ভাড়াটিয়া নির্বাচন করুন --" },
  none: { en: "None", bn: "নেই" },
  leaseStart: { en: "Lease Start", bn: "চুক্তির শুরু" },
  shop: { en: "Shop", bn: "দোকান" },
  actions: { en: "Actions", bn: "কর্ম" },
  loginFailed: { en: "Login failed", bn: "লগইন ব্যর্থ" },
  saved: { en: "Saved", bn: "সংরক্ষিত" },
  deleted: { en: "Deleted", bn: "মুছে ফেলা হয়েছে" },
  confirmDelete: { en: "Are you sure you want to delete?", bn: "আপনি কি নিশ্চিত মুছে ফেলতে চান?" },
};

const enToBn = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
const enMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const bnMonths = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

export function toBnDigits(s) {
  return String(s).replace(/\d/g, (d) => enToBn[d] || d);
}

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("lang") || "both");
  useEffect(() => { localStorage.setItem("lang", mode); }, [mode]);

  const t = (key) => {
    const e = dict[key];
    if (!e) return key;
    if (mode === "en") return e.en;
    if (mode === "bn") return e.bn;
    return e.bn;
  };
  const tEn = (key) => dict[key]?.en || key;
  const tBn = (key) => dict[key]?.bn || key;

  const fmtBDT = (n) => {
    const num = new Intl.NumberFormat("en-IN").format(n || 0);
    if (mode === "en") return `৳ ${num}`;
    return `৳ ${toBnDigits(num)}`;
  };

  const fmtMonth = (yyyymm) => {
    if (!yyyymm) return "";
    const [y, m] = yyyymm.split("-");
    const idx = parseInt(m, 10) - 1;
    if (idx < 0 || idx > 11) return yyyymm;
    if (mode === "en") return `${enMonths[idx]} ${y}`;
    if (mode === "bn") return `${bnMonths[idx]} ${toBnDigits(y)}`;
    return `${bnMonths[idx]} ${toBnDigits(y)} / ${enMonths[idx]} ${y}`;
  };

  const fmtNum = (n) => mode === "en" ? String(n ?? 0) : toBnDigits(n ?? 0);

  return <Ctx.Provider value={{ mode, setMode, t, tEn, tBn, fmtBDT, fmtMonth, fmtNum }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be inside LangProvider");
  return v;
}

export function L({ k }) {
  const { mode, tEn, tBn } = useLang();
  if (mode === "en") return <span>{tEn(k)}</span>;
  if (mode === "bn") return <span className="bn">{tBn(k)}</span>;
  return (
    <span>
      <span className="bn">{tBn(k)}</span>
      <span className="label-bn">{tEn(k)}</span>
    </span>
  );
}
