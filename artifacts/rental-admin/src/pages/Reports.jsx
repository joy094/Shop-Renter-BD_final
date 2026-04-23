import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

const COLORS = ["#0d6e62", "#c89a3a", "#1e8449", "#c0392b"];

export default function Reports() {
  const [collection, setCollection] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [top, setTop] = useState([]);
  const { fmtBDT, fmtMonth, fmtNum } = useLang();

  useEffect(() => {
    api.get("/api/reports/monthly-collection?months=12").then(setCollection);
    api.get("/api/reports/occupancy").then(setOccupancy);
    api.get("/api/reports/top-tenants?limit=5").then(setTop);
  }, []);

  const data = collection.map((c) => ({ ...c, label: fmtMonth(c.month).split(" ")[0] }));
  const occData = occupancy ? [
    { name: "Occupied", value: occupancy.occupied },
    { name: "Vacant", value: occupancy.vacant },
  ] : [];

  return (
    <div>
      <div className="page-header"><h2 className="page-title"><L k="reports" /></h2></div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}><L k="monthlyCollection" /></h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => fmtBDT(v)} />
              <Legend />
              <Bar dataKey="expected" fill="#c89a3a" name="Expected" />
              <Bar dataKey="collected" fill="#0d6e62" name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ marginTop: 0 }}><L k="occupancyChart" /></h3>
          {occupancy && (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={occData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} label>
                    {occData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
            <L k="topTenants" />
          </div>
          {top.length === 0 ? <div className="empty"><L k="noData" /></div> : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th style={{ textAlign: "right" }}><L k="paid" /></th><th style={{ textAlign: "right" }}><L k="amountDue" /></th></tr></thead>
              <tbody>
                {top.map((row, i) => (
                  <tr key={i}>
                    <td>{row.tenant?.name || "-"}<div className="muted" style={{ fontSize: 12 }}>{row.tenant?.phone}</div></td>
                    <td style={{ textAlign: "right", fontWeight: 500, color: "var(--success)" }}>{fmtBDT(row.totalPaid)}</td>
                    <td style={{ textAlign: "right" }} className="muted">{fmtBDT(row.totalDue)}</td>
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
