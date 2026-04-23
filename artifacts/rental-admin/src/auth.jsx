import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/me")
      .then((r) => setUser(r.authenticated ? r.user : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const r = await api.post("/api/auth/login", { username, password });
    setUser(r.user);
    return r;
  };
  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
