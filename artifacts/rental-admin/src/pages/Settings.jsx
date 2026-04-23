import { useState } from "react";
import { api } from "../api.js";
import { L, useLang } from "../i18n.jsx";
import { useToast } from "../components/Toast.jsx";
import { useAuth } from "../auth.jsx";
import { Settings as SettingsIcon, Languages, KeyRound, Save } from "lucide-react";

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
      <div className="page-header">
        <div>
          <h2 className="page-title"><SettingsIcon size={22} /> <L k="settings" /></h2>
          <div className="page-sub">{user?.name} · {user?.username}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3><Languages size={16} /> <L k="language" /></h3></div>
          <div className="card-pad">
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Choose how labels are displayed throughout the app.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { v: "bn", label: "বাংলা", sub: "Bangla only" },
                { v: "en", label: "English", sub: "English only" },
                { v: "both", label: "বাংলা + English", sub: "Show both languages" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  className={`btn ${mode === opt.v ? "btn-primary" : "btn-secondary"}`}
                  style={{ justifyContent: "flex-start", padding: "12px 16px", textAlign: "left" }}
                  onClick={() => setMode(opt.v)}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{ fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>{opt.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3><KeyRound size={16} /> <L k="changePassword" /></h3></div>
          <div className="card-pad">
            <form onSubmit={change}>
              <div className="field">
                <label className="label"><L k="currentPassword" /></label>
                <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required />
              </div>
              <div className="field">
                <label className="label"><L k="newPassword" /></label>
                <input type="password" value={nw} onChange={(e) => setNw(e.target.value)} required minLength={6} />
              </div>
              <button className="btn btn-primary" disabled={busy}><Save size={15} /> <L k="save" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
