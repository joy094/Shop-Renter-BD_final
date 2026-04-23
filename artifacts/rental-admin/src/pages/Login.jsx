import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { L, useLang } from "../i18n.jsx";
import { useToast } from "../components/Toast.jsx";

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
    try {
      await login(u, p);
    } catch (err) {
      toast.show(err.message || t("loginFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--primary-light), var(--bg))", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--primary)"><path d="M3 9l1-5h16l1 5v2a3 3 0 0 1-3 3v6H5v-6a3 3 0 0 1-3-3V9zm2 0v2a1 1 0 0 0 1 1 1 1 0 0 0 1-1V9H5zm4 0v2a1 1 0 0 0 1 1 1 1 0 0 0 1-1V9H9zm4 0v2a1 1 0 0 0 1 1 1 1 0 0 0 1-1V9h-2zm4 0v2a1 1 0 0 0 1 1 1 1 0 0 0 1-1V9h-2z"/></svg>
          </div>
          <h1 className="bn" style={{ margin: 0, color: "var(--primary)", fontSize: 24 }}>দোকান ভাড়া</h1>
          <div style={{ color: "var(--primary)", fontSize: 15, fontWeight: 500, marginTop: 2 }}>Dokan Bhara</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            <span className="bn">দোকান ভাড়া ব্যবস্থাপনা</span> · Shop Rental Management
          </div>
        </div>
        <form onSubmit={submit} style={{ padding: 28 }}>
          <div className="field">
            <label className="label"><L k="username" /></label>
            <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required />
          </div>
          <div className="field">
            <label className="label"><L k="password" /></label>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "..." : <L k="login" />}
          </button>
          <div style={{ marginTop: 14, padding: 10, background: "var(--bg)", borderRadius: 8, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            Demo: <b>admin</b> / <b>admin123</b>
          </div>
        </form>
      </div>
    </div>
  );
}
