import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

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

  if (!summary) return <div className="muted">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <L k="dashboard" />
          <span className="bn">{fmtMonth(summary.currentMonth)}</span>
        </h2>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-label"><L k="totalShops" /></div>
          <div className="stat-value">{fmtNum(summary.totalShops)}</div>
          <div className="stat-sub">
            <span className="stat-success">{fmtNum(summary.occupiedShops)}</span> occupied · {fmtNum(summary.vacantShops)} vacant
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><L k="totalTenants" /></div>
          <div className="stat-value">{fmtNum(summary.totalTenants)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><L k="collectedThisMonth" /></div>
          <div className="stat-value stat-accent">{fmtBDT(summary.collectedThisMonth)}</div>
          <div className="stat-sub">of {fmtBDT(summary.expectedThisMonth)} expected</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label"><L k="outstanding" /></div>
          <div className="stat-value stat-danger">{fmtBDT(summary.outstandingThisMonth)}</div>
          <div className="stat-sub">
            <span className="stat-success">{fmtNum(summary.paidCount)} paid</span> · <span className="stat-danger">{fmtNum(summary.unpaidCount)} unpaid</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
            <L k="recentPayments" />
          </div>
          {recent.length === 0 ? (
            <div className="empty"><L k="noData" /></div>
          ) : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th><L k="shop" /></th><th><L k="month" /></th><th style={{ textAlign: "right" }}><L k="amountPaid" /></th></tr></thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p._id}>
                    <td>{p.tenant?.name || "-"}</td>
                    <td>{p.shop?.code || "-"}</td>
                    <td>{fmtMonth(p.month)}</td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>{fmtBDT(p.amountPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
            <L k="reminders" />
          </div>
          {reminders.length === 0 ? (
            <div className="empty">All caught up!</div>
          ) : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th><L k="shop" /></th><th style={{ textAlign: "right" }}><L k="outstanding" /></th><th><L k="status" /></th></tr></thead>
              <tbody>
                {reminders.map((p) => (
                  <tr key={p._id}>
                    <td>{p.tenant?.name || "-"}<div className="muted" style={{ fontSize: 12 }}>{p.tenant?.phone}</div></td>
                    <td>{p.shop?.code || "-"}</td>
                    <td style={{ textAlign: "right", color: "var(--danger)", fontWeight: 500 }}>{fmtBDT(p.outstanding)}</td>
                    <td><StatusBadge status={p.amountPaid > 0 ? "partial" : "unpaid"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
