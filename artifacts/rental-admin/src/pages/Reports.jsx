import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { BarChart3, PieChart as PieIcon, Trophy, Inbox } from "lucide-react";

const COLORS = ["#0d6e62", "#c89a3a"];

export default function Reports() {
  const [collection, setCollection] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [top, setTop] = useState([]);
  const { fmtBDT, fmtMonth } = useLang();

  useEffect(() => {
    api.get("/api/reports/monthly-collection?months=12").then(setCollection);
    api.get("/api/reports/occupancy").then(setOccupancy);
    api.get("/api/reports/top-tenants?limit=5").then(setTop);
  }, []);

  const data = collection.map((c) => ({ ...c, label: fmtMonth(c.month).split(" ")[0].slice(0, 3) }));
  const occData = occupancy ? [
    { name: "Occupied", value: occupancy.occupied },
    { name: "Vacant", value: occupancy.vacant },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"><BarChart3 size={22} /> <L k="reports" /></h2>
          <div className="page-sub">Last 12 months overview</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><h3><BarChart3 size={16} /> <L k="monthlyCollection" /></h3></div>
        <div className="card-pad">
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7785" }} axisLine={{ stroke: "#e4e9ee" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7785" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => fmtBDT(v)}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e4e9ee", boxShadow: "var(--shadow-md)", fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="expected" fill="#c89a3a" name="Expected" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" fill="#0d6e62" name="Collected" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3><PieIcon size={16} /> <L k="occupancyChart" /></h3></div>
          <div className="card-pad">
            {occupancy && (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={occData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2}>
                      {occData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e4e9ee", fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3><Trophy size={16} /> <L k="topTenants" /></h3></div>
          {top.length === 0 ? <div className="empty"><Inbox size={36} /><L k="noData" /></div> : (
            <table>
              <thead><tr><th><L k="tenant" /></th><th style={{ textAlign: "right" }}><L k="paid" /></th><th style={{ textAlign: "right" }}><L k="amountDue" /></th></tr></thead>
              <tbody>
                {top.map((row, i) => {
                  const initials = (row.tenant?.name || "?").split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={i}>
                      <td>
                        <div className="tenant-cell">
                          <div className="tenant-avatar">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{row.tenant?.name || "-"}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{row.tenant?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--success)" }}>{fmtBDT(row.totalPaid)}</td>
                      <td style={{ textAlign: "right" }} className="muted">{fmtBDT(row.totalDue)}</td>
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
