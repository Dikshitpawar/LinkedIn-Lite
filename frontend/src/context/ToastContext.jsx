import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "info", duration = 3500) => {
    const id = ++_id;
    setToasts((p) => [...p, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((p) =>
        p.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 320);
    }, duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((p) => p.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 320);
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <ToastList toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastList({ toasts, dismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

const TOAST_CONFIG = {
  success: {
    icon: "✓",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
  },
  error: {
    icon: "✕",
    color: "#f5484c",
    bg: "rgba(245,72,76,0.12)",
    border: "rgba(245,72,76,0.25)",
  },
  info: {
    icon: "ℹ",
    color: "#a3a3a3",
    bg: "rgba(163,163,163,0.12)",
    border: "rgba(163,163,163,0.25)",
  },
  warning: {
    icon: "⚠",
    color: "#f5a524",
    bg: "rgba(245,165,36,0.12)",
    border: "rgba(245,165,36,0.25)",
  },
};

function Toast({ toast, onDismiss }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: "all",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "rgba(21,22,31,0.95)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        maxWidth: "360px",
        cursor: "pointer",
        animation: toast.exiting
          ? "toastOut 0.3s ease both"
          : "toastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both",
      }}
    >
      <span
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: cfg.bg,
          color: cfg.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </span>
      <span
        style={{
          fontSize: "13.5px",
          fontWeight: 500,
          color: "#f0f0fa",
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};
