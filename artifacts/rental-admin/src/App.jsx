import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tenants from "./pages/Tenants.jsx";
import Shops from "./pages/Shops.jsx";
import Payments from "./pages/Payments.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading...</div>;
  }
  if (!user) {
    return (
      <ToastProvider>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </ToastProvider>
    );
  }
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
