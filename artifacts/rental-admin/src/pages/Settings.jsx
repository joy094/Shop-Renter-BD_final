import { useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../auth.jsx";

export default function Settings() {
  const { t, mode, setMode } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [busy, setBusy] = useState(false);

  const change = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/api/auth/password", { currentPassword: cur, newPassword: nw });
      toast.show(t("saved"));
      setCur(""); setNw("");
    } catch (err) { toast.show(err.message, "error"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="page-header"><h2 className="page-title"><L k="settings" /></h2></div>

      <div className="grid grid-2">
        <div className="card card-pad">
          <h3 style={{ marginTop: 0 }}><L k="language" /></h3>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { v: "bn", label: "বাংলা" },
              { v: "en", label: "English" },
              { v: "both", label: "বাংলা + English" },
            ].map((opt) => (
              <button
                key={opt.v}
                className={`btn ${mode === opt.v ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setMode(opt.v)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginTop: 0 }}><L k="changePassword" /></h3>
          <div className="muted" style={{ marginBottom: 14, fontSize: 13 }}>{user?.name} ({user?.username})</div>
          <form onSubmit={change}>
            <div className="field">
              <label className="label"><L k="currentPassword" /></label>
              <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label"><L k="newPassword" /></label>
              <input type="password" value={nw} onChange={(e) => setNw(e.target.value)} required minLength={6} />
            </div>
            <button className="btn btn-primary" disabled={busy}><L k="save" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
