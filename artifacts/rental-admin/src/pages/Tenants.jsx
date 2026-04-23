import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";

const empty = { name: "", phone: "", nidNumber: "", address: "", email: "", notes: "" };

export default function Tenants() {
  const { t } = useLang();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/api/tenants").then(setList);
  useEffect(() => { load(); }, []);

  const open = (row) => {
    if (row) { setEditing(row); setForm({ ...empty, ...row }); }
    else { setEditing(null); setForm(empty); }
  };
  const close = () => setEditing(false);
  const save = async () => {
    try {
      if (editing && editing._id) await api.put(`/api/tenants/${editing._id}`, form);
      else await api.post("/api/tenants", form);
      toast.show(t("saved"));
      close(); load();
    } catch (e) { toast.show(e.message, "error"); }
  };
  const del = async (row) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api.del(`/api/tenants/${row._id}`);
      toast.show(t("deleted"));
      load();
    } catch (e) { toast.show(e.message, "error"); }
  };

  const filtered = list.filter((x) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return x.name.toLowerCase().includes(s) || (x.phone || "").includes(s) || (x.nidNumber || "").includes(s);
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><L k="tenants" /></h2>
        <button className="btn btn-primary" onClick={() => open(null)}>+ <L k="newTenant" /></button>
      </div>

      <div className="toolbar">
        <input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty"><L k="noData" /></div>
        ) : (
          <table>
            <thead><tr><th><L k="name" /></th><th><L k="phone" /></th><th><L k="nid" /></th><th><L k="address" /></th><th></th></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row._id}>
                  <td><div style={{ fontWeight: 500 }}>{row.name}</div>{row.email && <div className="muted" style={{ fontSize: 12 }}>{row.email}</div>}</td>
                  <td>{row.phone}</td>
                  <td className="muted">{row.nidNumber || "-"}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{row.address || "-"}</td>
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

      {editing !== false && editing !== null !== false && (editing === null || editing) ? null : null}
      {editing !== false && (
        <TenantModal form={form} setForm={setForm} editing={editing} onClose={close} onSave={save} />
      )}
    </div>
  );
}

function TenantModal({ form, setForm, editing, onClose, onSave }) {
  const { t } = useLang();
  if (editing === false) return null;
  const F = (k, label, opts = {}) => (
    <div className="field">
      <label className="label"><L k={label} /></label>
      <input value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...opts} />
    </div>
  );
  return (
    <Modal
      title={editing && editing._id ? t("editTenant") : t("newTenant")}
      onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}><L k="cancel" /></button>
        <button className="btn btn-primary" onClick={onSave}><L k="save" /></button>
      </>}
    >
      {F("name", "name", { required: true })}
      {F("phone", "phone", { required: true })}
      {F("nidNumber", "nid")}
      {F("email", "email", { type: "email" })}
      <div className="field">
        <label className="label"><L k="address" /></label>
        <textarea rows={2} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="field">
        <label className="label"><L k="notes" /></label>
        <textarea rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </Modal>
  );
}
