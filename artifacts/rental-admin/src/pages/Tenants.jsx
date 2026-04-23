import { useEffect, useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import Modal from "../components/Modal.jsx";
import { useToast } from "../components/Toast.jsx";
import { Users, Plus, Pencil, Trash2, Search, Inbox, Phone, Mail } from "lucide-react";

const empty = { name: "", phone: "", nidNumber: "", address: "", email: "", notes: "" };

export default function Tenants() {
  const { t } = useLang();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);
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
      toast.show(t("saved")); close(); load();
    } catch (e) { toast.show(e.message, "error"); }
  };
  const del = async (row) => {
    if (!confirm(t("confirmDelete"))) return;
    try { await api.del(`/api/tenants/${row._id}`); toast.show(t("deleted")); load(); }
    catch (e) { toast.show(e.message, "error"); }
  };

  const filtered = list.filter((x) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return x.name.toLowerCase().includes(s) || (x.phone || "").includes(s) || (x.nidNumber || "").includes(s);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"><Users size={22} /> <L k="tenants" /></h2>
          <div className="page-sub">{filtered.length} total</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => open(null)}><Plus size={15} /> <L k="newTenant" /></button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={15} />
          <input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty"><Inbox size={40} /><L k="noData" /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th><L k="name" /></th><th><L k="phone" /></th><th><L k="nid" /></th><th><L k="address" /></th><th></th></tr></thead>
              <tbody>
                {filtered.map((row) => {
                  const initials = row.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={row._id}>
                      <td>
                        <div className="tenant-cell">
                          <div className="tenant-avatar">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{row.name}</div>
                            {row.email && <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} />{row.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Phone size={13} className="muted" />{row.phone}</span></td>
                      <td className="muted">{row.nidNumber || "-"}</td>
                      <td className="muted" style={{ fontSize: 13, maxWidth: 280 }}>{row.address || "-"}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button className="btn btn-ghost btn-icon" title={t("edit")} onClick={() => open(row)}><Pencil size={15} /></button>
                        <button className="btn btn-ghost btn-icon" title={t("delete")} onClick={() => del(row)} style={{ color: "var(--danger)" }}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== false && (
        <Modal
          title={editing && editing._id ? t("editTenant") : t("newTenant")}
          onClose={close}
          footer={<>
            <button className="btn btn-secondary" onClick={close}><L k="cancel" /></button>
            <button className="btn btn-primary" onClick={save}><L k="save" /></button>
          </>}
        >
          <div className="grid grid-2">
            <div className="field">
              <label className="label"><L k="name" /></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label className="label"><L k="phone" /></label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="field">
              <label className="label"><L k="nid" /></label>
              <input value={form.nidNumber || ""} onChange={(e) => setForm({ ...form, nidNumber: e.target.value })} />
            </div>
            <div className="field">
              <label className="label"><L k="email" /></label>
              <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label className="label"><L k="address" /></label>
            <textarea rows={2} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
