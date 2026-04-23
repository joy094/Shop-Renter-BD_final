import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLang, L } from "../i18n.jsx";
import { useAuth } from "../auth.jsx";

const NAV = [
  { to: "/", key: "dashboard", end: true },
  { to: "/tenants", key: "tenants" },
  { to: "/shops", key: "shops" },
  { to: "/payments", key: "payments" },
  { to: "/reports", key: "reports" },
  { to: "/settings", key: "settings" },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { t, mode } = useLang();
  const { user, logout } = useAuth();
  const loc = useLocation();
  const current = NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <h1>দোকান ভাড়া</h1>
          <p>Dokan Bhara · Shop Rental</p>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span><L k={n.key} /></span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8, fontWeight: 500 }}>{user?.name}</div>
          <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={logout}>
            <L k="logout" />
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="btn btn-ghost menu-btn" onClick={() => setOpen(!open)} aria-label="menu">☰</button>
          <div className="topbar-title">{current ? t(current.key) : ""}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {mode === "both" ? "BN/EN" : mode.toUpperCase()}
          </div>
        </div>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
