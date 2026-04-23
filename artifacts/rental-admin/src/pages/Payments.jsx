import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { CreditCard, Plus, Pencil, Trash2, Inbox, Sparkles } from "lucide-react";

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Payments() {
  const { t, fmtBDT, fmtMonth } = useLang();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [shops, setShops] = useState([]);
  const [filterMonth, setFilterMonth] = useState(thisMonth());
  const [filterStatus, setFilterStatus] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    const q = new URLSearchParams();
    if (filterMonth) q.set("month", filterMonth);
    if (filterStatus) q.set("status", filterStatus);
    setList(await api.get(`/api/payments?${q.toString()}`));
  };
  useEffect(() => { load(); }, [filterMonth, filterStatus]);
  useEffect(() => { api.get("/api/shops").then(setShops); }, []);

  const months = useMemo(() => {
    const arr = [];
    const d = new Date();
    for (let i = -2; i < 12; i++) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      arr.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
    }
    return arr;
  }, []);

  const open = (row) => {
    if (row) {
      setEditing(row);
      setForm({
        amountDue: row.amountDue, amountPaid: row.amountPaid,
        paidOn: row.paidOn || "", method: row.method || "", note: row.note || "",
      });
    } else {
      setEditing(null);
      setForm({ shopId: "", month: thisMonth(), amountDue: "", amountPaid: "", paidOn: "", method: "cash" });
    }
  };
  const close = () => setEditing(false);
  const save = async () => {
    try {
      if (editing && editing._id) {
        await api.put(`/api/payments/${editing._id}`, {
          amountDue: Number(form.amountDue), amountPaid: Number(form.amountPaid),
          paidOn: form.paidOn || null, method: form.method || null, note: form.note || null,
        });
      } else {
        const shop = shops.find((s) => s._id === form.shopId);
        await api.post("/api/payments", {
          shopId: form.shopId, month: form.month,
          amountDue: Number(form.amountDue || shop?.monthlyRent || 0),
          amountPaid: Number(form.amountPaid),
          paidOn: form.paidOn || null, method: form.method || null, note: form.note || null,
        });
      }
      toast.show(t("saved")); close(); load();
    } catch (e) { toast.show(e.message, "error"); }
  };
  const del = async (row) => {
    if (!confirm(t("confirmDelete"))) return;
    try { await api.del(`/api/payments/${row._id}`); toast.show(t("deleted")); load(); }
    catch (e) { toast.show(e.message, "error"); }
  };
  const generateMonthly = async () => {
    try {
      const r = await api.post("/api/payments/generate-monthly", { month: filterMonth });
      toast.show(`${r.created} created`); load();
    } catch (e) { toast.show(e.message, "error"); }
  };

  const totalDue = list.reduce((s, p) => s + p.amountDue, 0);
  const totalPaid = list.reduce((s, p) => s + p.amountPaid, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"><CreditCard size={22} /> <L k="payments" /></h2>
          <div className="page-sub">{fmtBDT(totalPaid)} / {fmtBDT(totalDue)} · {list.length} records</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={generateMonthly}><Sparkles size={15} /> <L k="generateMonthly" /></button>
          <button className="btn btn-primary" onClick={() => open(null)}><Plus size={15} /> <L k="recordPayment" /></button>
        </div>
      </div>

      <div className="toolbar">
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="">{t("filterMonth")}</option>
          {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">{t("filterStatus")}</option>
          <option value="paid">{t("paid")}</option>
          <option value="partial">{t("partial")}</option>
          <option value="unpaid">{t("unpaid")}</option>
        </select>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty"><Inbox size={40} /><L k="noData" /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th><L k="month" /></th>
                  <th><L k="shop" /></th>
                  <th><L k="tenant" /></th>
                  <th style={{ textAlign: "right" }}><L k="amountDue" /></th>
                  <th style={{ textAlign: "right" }}><L k="amountPaid" /></th>
                  <th><L k="status" /></th>
                  <th><L k="paidOn" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p._id}>
                    <td>{fmtMonth(p.month)}</td>
                    <td><span className="shop-code-pill">{p.shop?.code || "-"}</span></td>
                    <td>{p.tenant?.name || "-"}</td>
                    <td style={{ textAlign: "right" }}>{fmtBDT(p.amountDue)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: p.amountPaid >= p.amountDue ? "var(--success)" : (p.amountPaid > 0 ? "var(--warning)" : "var(--danger)") }}>{fmtBDT(p.amountPaid)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="muted" style={{ fontSize: 13 }}>{p.paidOn || "-"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost btn-icon" title={t("edit")} onClick={() => open(p)}><Pencil size={15} /></button>
                      <button className="btn btn-ghost btn-icon" title={t("delete")} onClick={() => del(p)} style={{ color: "var(--danger)" }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== false && (
        <Modal
          title={editing && editing._id ? t("edit") + " · " + t("payments") : t("recordPayment")}
          onClose={close}
          footer={<>
            <button className="btn btn-secondary" onClick={close}><L k="cancel" /></button>
            <button className="btn btn-primary" onClick={save}><L k="save" /></button>
          </>}
        >
          {(!editing || !editing._id) && (
            <div className="grid grid-2">
              <div className="field">
                <label className="label"><L k="shop" /></label>
                <select value={form.shopId} onChange={(e) => {
                  const s = shops.find((x) => x._id === e.target.value);
                  setForm({ ...form, shopId: e.target.value, amountDue: s?.monthlyRent || "" });
                }}>
                  <option value="">--</option>
                  {shops.filter((s) => s.tenantId).map((s) => (
                    <option key={s._id} value={s._id}>{s.code} — {s.tenant?.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label"><L k="month" /></label>
                <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                  {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-2">
            <div className="field">
              <label className="label"><L k="amountDue" /></label>
              <input type="number" value={form.amountDue ?? ""} onChange={(e) => setForm({ ...form, amountDue: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="amountPaid" /></label>
              <input type="number" value={form.amountPaid ?? ""} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="paidOn" /></label>
              <input type="date" value={form.paidOn || ""} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="method" /></label>
              <select value={form.method || ""} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="">--</option>
                <option value="cash">Cash</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
                <option value="bank">Bank</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label"><L k="notes" /></label>
            <textarea rows={2} value={form.note || ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
