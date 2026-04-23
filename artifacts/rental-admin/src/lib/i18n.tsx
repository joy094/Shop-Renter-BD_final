import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageMode = "en" | "bn" | "both";

interface LanguageContextType {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  t: (key: keyof typeof translations) => ReactNode;
  formatBDT: (amount: number) => string;
  formatMonth: (yyyyMm: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const translations = {
  // Navigation & Common
  "nav.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "nav.tenants": { en: "Tenants", bn: "ভাড়াটিয়া" },
  "nav.shops": { en: "Shops", bn: "দোকান" },
  "nav.payments": { en: "Payments", bn: "ভাড়া আদায়" },
  "nav.reports": { en: "Reports", bn: "রিপোর্ট" },
  "nav.settings": { en: "Settings", bn: "সেটিংস" },
  "nav.signout": { en: "Sign out", bn: "লগ আউট" },
  
  // Dashboard
  "dash.kpi.shops": { en: "Total Shops", bn: "মোট দোকান" },
  "dash.kpi.occupied": { en: "Occupied/Vacant", bn: "ভাড়া/খালি" },
  "dash.kpi.tenants": { en: "Total Tenants", bn: "মোট ভাড়াটিয়া" },
  "dash.kpi.expected": { en: "Expected This Month", bn: "এই মাসের প্রাপ্য" },
  "dash.kpi.collected": { en: "Collected This Month", bn: "এই মাসের আদায়" },
  "dash.kpi.outstanding": { en: "Outstanding", bn: "বকেয়া" },
  "dash.recentPayments": { en: "Recent Payments", bn: "সাম্প্রতিক লেনদেন" },
  "dash.dueReminders": { en: "Due Reminders", bn: "বকেয়া রিমাইন্ডার" },
  "dash.collectionChart": { en: "Monthly Collection", bn: "মাসিক আদায়" },
  "dash.occupancyChart": { en: "Shop Occupancy", bn: "দোকান ভাড়া পরিস্থিতি" },

  // Actions
  "action.save": { en: "Save", bn: "সংরক্ষণ করুন" },
  "action.cancel": { en: "Cancel", bn: "বাতিল" },
  "action.addTenant": { en: "Add Tenant", bn: "ভাড়াটিয়া যোগ করুন" },
  "action.addShop": { en: "Add Shop", bn: "দোকান যোগ করুন" },
  "action.recordPayment": { en: "Record Payment", bn: "ভাড়া গ্রহণ" },
  "action.generateInvoices": { en: "Generate Invoices", bn: "ইনভয়েস তৈরি করুন" },
  "action.assignTenant": { en: "Assign Tenant", bn: "ভাড়াটিয়া নির্ধারণ করুন" },
  "action.edit": { en: "Edit", bn: "সম্পাদনা" },
  "action.delete": { en: "Delete", bn: "মুছে ফেলুন" },
  
  // Fields & Tables
  "field.name": { en: "Name", bn: "নাম" },
  "field.phone": { en: "Phone", bn: "মোবাইল" },
  "field.nid": { en: "NID Number", bn: "এনআইডি" },
  "field.address": { en: "Address", bn: "ঠিকানা" },
  "field.email": { en: "Email", bn: "ইমেইল" },
  "field.notes": { en: "Notes", bn: "নোট" },
  "field.shopCode": { en: "Shop Code", bn: "দোকান নং" },
  "field.location": { en: "Location", bn: "অবস্থান" },
  "field.size": { en: "Size (Sqft)", bn: "আয়তন (বর্গফুট)" },
  "field.rent": { en: "Monthly Rent", bn: "মাসিক ভাড়া" },
  "field.deposit": { en: "Deposit Amount", bn: "অগ্রিম জমা" },
  "field.status": { en: "Status", bn: "অবস্থা" },
  "field.month": { en: "Month", bn: "মাস" },
  "field.amountDue": { en: "Amount Due", bn: "প্রাপ্য" },
  "field.amountPaid": { en: "Amount Paid", bn: "আদায়" },
  "field.paymentMethod": { en: "Payment Method", bn: "পেমেন্ট মাধ্যম" },
  "field.date": { en: "Date", bn: "তারিখ" },
  "field.daysOverdue": { en: "Days Overdue", bn: "দিন বকেয়া" },

  // Statuses
  "status.vacant": { en: "Vacant", bn: "খালি" },
  "status.occupied": { en: "Occupied", bn: "ভাড়া দেওয়া" },
  "status.paid": { en: "Paid", bn: "পরিশোধিত" },
  "status.unpaid": { en: "Unpaid", bn: "বকেয়া" },
  "status.partial": { en: "Partial", bn: "আংশিক" },

  // Methods
  "method.cash": { en: "Cash", bn: "ক্যাশ" },
  "method.bkash": { en: "bKash", bn: "বিকাশ" },
  "method.nagad": { en: "Nagad", bn: "নগদ" },
  "method.rocket": { en: "Rocket", bn: "রকেট" },
  "method.bank": { en: "Bank", bn: "ব্যাংক" },
  "method.other": { en: "Other", bn: "অন্যান্য" },

  // Auth
  "auth.login": { en: "Login", bn: "লগইন" },
  "auth.username": { en: "Username", bn: "ইউজারনেম" },
  "auth.password": { en: "Password", bn: "পাসওয়ার্ড" },
  "auth.title": { en: "Dokan Bhara", bn: "দোকান ভাড়া" },
  "auth.subtitle": { en: "Shop Rental Management", bn: "দোকান ভাড়া ব্যবস্থাপনা" },

  // Settings
  "settings.language": { en: "Language Preference", bn: "ভাষার পছন্দ" },
  "settings.businessName": { en: "Business Name", bn: "প্রতিষ্ঠানের নাম" },
  "settings.businessNameDesc": { en: "Displayed in the top header", bn: "উপরে হেডারে দেখানো হবে" },

  // Generic
  "generic.loading": { en: "Loading...", bn: "লোড হচ্ছে..." },
  "generic.search": { en: "Search...", bn: "খুঁজুন..." },
  "generic.noData": { en: "No data available", bn: "কোন তথ্য নেই" },
  "generic.all": { en: "All", bn: "সব" },
};

const engToBnDigits: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem("app-lang-mode");
    return (saved as LanguageMode) || "both";
  });

  useEffect(() => {
    localStorage.setItem("app-lang-mode", mode);
  }, [mode]);

  const t = (key: keyof typeof translations) => {
    const item = translations[key];
    if (!item) return key;

    if (mode === "en") return <span className="font-sans">{item.en}</span>;
    if (mode === "bn") return <span className="font-bengali font-medium">{item.bn}</span>;
    
    // both
    return (
      <span className="inline-flex flex-col leading-tight">
        <span className="font-bengali font-medium">{item.bn}</span>
        <span className="text-[0.65em] font-sans opacity-70 mt-[1px]">{item.en}</span>
      </span>
    );
  };

  const formatBDT = (amount: number) => {
    const enFmt = new Intl.NumberFormat('en-IN').format(amount);
    if (mode === "en") return `৳ ${enFmt}`;
    
    const bnFmt = enFmt.replace(/\d/g, d => engToBnDigits[d] || d);
    if (mode === "bn") return `৳ ${bnFmt}`;
    
    // both
    return `৳ ${bnFmt}`; // Use bangla numerals for both
  };

  const formatMonth = (yyyyMm: string) => {
    if (!yyyyMm) return "";
    const [year, month] = yyyyMm.split("-");
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx < 0 || mIdx > 11) return yyyyMm;
    
    const enYear = year;
    const bnYear = year.replace(/\d/g, (d: string) => engToBnDigits[d] || d);
    
    if (mode === "en") return `${englishMonths[mIdx]} ${enYear}`;
    if (mode === "bn") return `${banglaMonths[mIdx]} ${bnYear}`;
    return `${banglaMonths[mIdx]} ${bnYear} / ${englishMonths[mIdx]} ${enYear}`;
  };

  return (
    <LanguageContext.Provider value={{ mode, setMode, t, formatBDT, formatMonth }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
