import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { L, useLang } from "../i18n.jsx";
import { useToast } from "../components/Toast.jsx";
import { Building2, User, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [u, setU] = useState("admin");
  const [p, setP] = useState("admin123");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await login(u, p); }
    catch (err) { toast.show(err.message || t("loginFailed"), "error"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #e0f1ee 0%, #f4f6f8 50%, #fdf3d7 100%)",
      padding: 16,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "32px 32px 0", textAlign: "center" }}>
          <div style={{
            width: 68, height: 68, margin: "0 auto 16px",
            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: "#fff", borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(13, 110, 98, 0.3)",
          }}>
            <Building2 size={32} />
          </div>
          <h1 style={{ margin: 0, color: "var(--text)", fontSize: 26, fontWeight: 700 }}>দোকান ভাড়া</h1>
          <div style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600, marginTop: 4 }}>Dokan Bhara</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            দোকান ভাড়া ব্যবস্থাপনা · Shop Rental Management
          </div>
        </div>
        <form onSubmit={submit} style={{ padding: 32 }}>
          <div className="field">
            <label className="label"><User size={14} style={{ verticalAlign: -2, marginRight: 6 }} /><L k="username" /></label>
            <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required />
          </div>
          <div className="field">
            <label className="label"><Lock size={14} style={{ verticalAlign: -2, marginRight: 6 }} /><L k="password" /></label>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", padding: "11px 16px" }} disabled={busy}>
            {busy ? "..." : <><LogIn size={16} /> <L k="login" /></>}
          </button>
          <div style={{ marginTop: 16, padding: 12, background: "var(--bg-soft)", borderRadius: 8, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Demo: <b style={{ color: "var(--text)" }}>admin</b> / <b style={{ color: "var(--text)" }}>admin123</b>
          </div>
        </form>
      </div>
    </div>
  );
}
