import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLang, L } from "../i18n.jsx";
import { useAuth } from "../auth.jsx";
import {
  LayoutDashboard, Users, Store, CreditCard, BarChart3, Settings as SettingsIcon,
  LogOut, Menu, X, Building2, Calendar
} from "lucide-react";

const NAV = [
  { to: "/", key: "dashboard", end: true, Icon: LayoutDashboard },
  { to: "/tenants", key: "tenants", Icon: Users },
  { to: "/shops", key: "shops", Icon: Store },
  { to: "/payments", key: "payments", Icon: CreditCard },
  { to: "/reports", key: "reports", Icon: BarChart3 },
  { to: "/settings", key: "settings", Icon: SettingsIcon },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { t, mode, fmtMonth } = useLang();
  const { user, logout } = useAuth();
  const loc = useLocation();
  const current = NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  const initials = (user?.name || "U").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div className="brand-text">
            <h1>দোকান ভাড়া</h1>
            <p>Dokan Bhara</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {NAV.map(({ to, key, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span className="nav-label"><L k={key} /></span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={logout}>
            <LogOut size={14} /> <L k="logout" />
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="btn btn-ghost btn-icon menu-btn" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-title">{current ? t(current.key) : ""}</div>
          <div className="topbar-meta">
            <Calendar size={14} /> {fmtMonth(monthStr)}
          </div>
        </div>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
