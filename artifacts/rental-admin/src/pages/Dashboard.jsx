import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import {
  Store, Users, TrendingUp, AlertTriangle, ReceiptText, BellRing,
  Inbox, Phone, ArrowDownRight
} from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [reminders, setReminders] = useState([]);
  const { fmtBDT, fmtMonth, fmtNum } = useLang();

  useEffect(() => {
    api.get("/api/dashboard/summary").then(setSummary);
    api.get("/api/dashboard/recent-payments").then(setRecent);
    api.get("/api/dashboard/reminders").then(setReminders);
  }, []);

  if (!summary) return <div className="muted" style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const collectionPct = summary.expectedThisMonth > 0
    ? Math.round((summary.collectedThisMonth / summary.expectedThisMonth) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"><L k="dashboard" /></h2>
          <div className="page-sub">{fmtMonth(summary.currentMonth)}</div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-head">
            <div className="stat-label"><L k="totalShops" /></div>
            <div className="stat-icon stat-icon-primary"><Store size={20} /></div>
          </div>
          <div className="stat-value">{fmtNum(summary.totalShops)}</div>
          <div className="stat-sub">
            <span className="stat-success">{fmtNum(summary.occupiedShops)} <L k="occupied" /></span>
            <span>·</span>
            <span>{fmtNum(summary.vacantShops)} <L k="vacant" /></span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-head">
            <div className="stat-label"><L k="totalTenants" /></div>
            <div className="stat-icon stat-icon-info"><Users size={20} /></div>
          </div>
          <div className="stat-value">{fmtNum(summary.totalTenants)}</div>
          <div className="stat-sub">Active</div>
        </div>

        <div className="card stat-card">
          <div className="stat-head">
            <div className="stat-label"><L k="collectedThisMonth" /></div>
            <div className="stat-icon stat-icon-gold"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: "var(--gold-dark)" }}>{fmtBDT(summary.collectedThisMonth)}</div>
          <div className="stat-sub">
            of {fmtBDT(summary.expectedThisMonth)} ({fmtNum(collectionPct)}%)
          </div>
          <div style={{ marginTop: 10, height: 6, background: "var(--bg-soft)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${collectionPct}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-dark))", borderRadius: 999, transition: "width 0.4s" }} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-head">
            <div className="stat-label"><L k="outstanding" /></div>
            <div className="stat-icon stat-icon-danger"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{fmtBDT(summary.outstandingThisMonth)}</div>
          <div className="stat-sub">
            <span className="stat-success">{fmtNum(summary.paidCount)} <L k="paid" /></span>
            <span>·</span>
            <span className="stat-danger">{fmtNum(summary.unpaidCount)} <L k="unpaid" /></span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <h3><ReceiptText size={16} /> <L k="recentPayments" /></h3>
          </div>
          {recent.length === 0 ? (
            <div className="empty"><Inbox size={36} /><L k="noData" /></div>
          ) : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th><L k="shop" /></th><th><L k="month" /></th><th style={{ textAlign: "right" }}><L k="amountPaid" /></th></tr></thead>
              <tbody>
                {recent.map((p) => {
                  const initials = (p.tenant?.name || "?").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="tenant-cell">
                          <div className="tenant-avatar">{initials}</div>
                          <div style={{ fontWeight: 500 }}>{p.tenant?.name || "-"}</div>
                        </div>
                      </td>
                      <td><span className="shop-code-pill">{p.shop?.code || "-"}</span></td>
                      <td className="muted">{fmtMonth(p.month)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--success)" }}>{fmtBDT(p.amountPaid)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h3><BellRing size={16} /> <L k="reminders" /></h3>
            {reminders.length > 0 && <span className="badge badge-unpaid">{fmtNum(reminders.length)}</span>}
          </div>
          {reminders.length === 0 ? (
            <div className="empty"><Inbox size={36} />All caught up!</div>
          ) : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th><L k="shop" /></th><th style={{ textAlign: "right" }}><L k="outstanding" /></th></tr></thead>
              <tbody>
                {reminders.map((p) => {
                  const initials = (p.tenant?.name || "?").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="tenant-cell">
                          <div className="tenant-avatar">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.tenant?.name || "-"}</div>
                            <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                              <Phone size={11} />{p.tenant?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span className="shop-code-pill">{p.shop?.code || "-"}</span></td>
                      <td style={{ textAlign: "right", color: "var(--danger)", fontWeight: 600 }}>
                        <ArrowDownRight size={13} style={{ verticalAlign: -2 }} /> {fmtBDT(p.outstanding)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
