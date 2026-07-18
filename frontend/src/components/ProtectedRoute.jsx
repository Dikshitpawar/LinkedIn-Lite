import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-1)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--surface-4)",
            borderTopColor: "var(--brand-500)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
