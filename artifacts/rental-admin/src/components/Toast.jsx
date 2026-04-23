import { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext(null);

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = "success") => {
    setT({ msg, type });
    setTimeout(() => setT(null), 2800);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {t && <div className={`toast ${t.type}`}>{t.msg}</div>}
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx) || { show: () => {} };
}
