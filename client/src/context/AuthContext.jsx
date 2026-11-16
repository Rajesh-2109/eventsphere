import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("es_user"));
      } catch {
        return null;
      }
    }),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("es_token"))
      api
        .get("/auth/me")
        .then((r) => setUser(r.data))
        .catch(() => {
          localStorage.removeItem("es_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const persist = (d) => {
    localStorage.setItem("es_token", d.token);
    localStorage.setItem("es_user", JSON.stringify(d.user));
    setUser(d.user);
  };
  const login = async (v) => {
      const r = await api.post("/auth/login", v);
      persist(r.data);
      return r.data.user;
    },
    register = async (v) => {
      const r = await api.post("/auth/register", v);
      persist(r.data);
      return r.data.user;
    },
    logout = () => {
      localStorage.removeItem("es_token");
      localStorage.removeItem("es_user");
      setUser(null);
    },
    refresh = async () => {
      const r = await api.get("/auth/me");
      setUser(r.data);
      localStorage.setItem("es_user", JSON.stringify(r.data));
    };
  return (
    <C.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
