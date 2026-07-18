import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { API_ORIGIN } from "../api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { accessToken, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());

  useEffect(() => {
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }
    const socket = io(API_ORIGIN, {
      auth: { token: accessToken },
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("Socket connection failed:", err.message);
      setConnected(false);
    });

    socket.on("user-status-change", ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(userId);
        else next.delete(userId);
        return next;
      });
    });
    socket.on("online-users-snapshot", ({ userIds }) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("notification", (payload) => {
      toast(payload.message || "New notification");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken, user]);

  const joinPostRoom = useCallback((postId) => {
    socketRef.current?.emit("join-post", postId);
  }, []);

  const leavePostRoom = useCallback((postId) => {
    socketRef.current?.emit("leave-post", postId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        onlineUsers,
        joinPostRoom,
        leavePostRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be inside SocketProvider");
  return ctx;
};
