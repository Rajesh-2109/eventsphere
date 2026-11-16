import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
const C = createContext(null);
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("es_token");
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: token ? { token } : {},
    });
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?._id]);
  return <C.Provider value={socket}>{children}</C.Provider>;
}
export const useSocket = () => useContext(C);
