import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const empty = { code: "", location: "", sizeSqft: "", monthlyRent: "", depositAmount: "", tenantId: "", leaseStart: "", notes: "" };

export default function Shops() {
  const { t, fmtBDT, fmtNum } = useLang();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => Promise.all([
    api.get("/api/shops").then(setList),
    api.get("/api/tenants").then(setTenants),
  ]);
  useEffect(() => { load(); }, []);

  const open = (row) => {
    if (row) { setEditing(row); setForm({ ...empty, ...row, tenantId: row.tenantId || "" }); }
    else { setEditing(null); setForm(empty); }
  };
  const close = () => setEditing(false);
  const save = async () => {
    const payload = {
      ...form,
      sizeSqft: form.sizeSqft ? Number(form.sizeSqft) : null,
      monthlyRent: Number(form.monthlyRent),
      depositAmount: Number(form.depositAmount || 0),
      tenantId: form.tenantId || null,
      leaseStart: form.leaseStart || null,
    };
    try {
      if (editing && editing._id) await api.put(`/api/shops/${editing._id}`, payload);
      else await api.post("/api/shops", payload);
      toast.show(t("saved")); close(); load();
    } catch (e) { toast.show(e.message, "error"); }
  };
  const del = async (row) => {
    if (!confirm(t("confirmDelete"))) return;
    try { await api.del(`/api/shops/${row._id}`); toast.show(t("deleted")); load(); }
    catch (e) { toast.show(e.message, "error"); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><L k="shops" /></h2>
        <button className="btn btn-primary" onClick={() => open(null)}>+ <L k="newShop" /></button>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty"><L k="noData" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th><L k="shopCode" /></th>
                <th><L k="location" /></th>
                <th style={{ textAlign: "right" }}><L k="size" /></th>
                <th style={{ textAlign: "right" }}><L k="monthlyRent" /></th>
                <th><L k="tenant" /></th>
                <th><L k="status" /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row._id}>
                  <td style={{ fontWeight: 600 }}>{row.code}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{row.location || "-"}</td>
                  <td style={{ textAlign: "right" }}>{row.sizeSqft ? fmtNum(row.sizeSqft) : "-"}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{fmtBDT(row.monthlyRent)}</td>
                  <td>{row.tenant?.name || <span className="muted">—</span>}</td>
                  <td><StatusBadge status={row.currentStatus} /></td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => open(row)}><L k="edit" /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => del(row)} style={{ color: "var(--danger)" }}><L k="delete" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== false && (
        <Modal
          title={editing && editing._id ? t("editShop") : t("newShop")}
          onClose={close}
          footer={<>
            <button className="btn btn-secondary" onClick={close}><L k="cancel" /></button>
            <button className="btn btn-primary" onClick={save}><L k="save" /></button>
          </>}
        >
          <div className="field">
            <label className="label"><L k="shopCode" /></label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div className="field">
            <label className="label"><L k="location" /></label>
            <input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label"><L k="size" /></label>
              <input type="number" value={form.sizeSqft || ""} onChange={(e) => setForm({ ...form, sizeSqft: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="monthlyRent" /></label>
              <input type="number" value={form.monthlyRent || ""} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} required />
            </div>
            <div className="field">
              <label className="label"><L k="deposit" /></label>
              <input type="number" value={form.depositAmount || ""} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="leaseStart" /></label>
              <input type="date" value={form.leaseStart || ""} onChange={(e) => setForm({ ...form, leaseStart: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="label"><L k="tenant" /></label>
            <select value={form.tenantId || ""} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
              <option value="">{t("selectTenant")}</option>
              {tenants.map((tn) => <option key={tn._id} value={tn._id}>{tn.name} — {tn.phone}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label"><L k="notes" /></label>
            <textarea rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
