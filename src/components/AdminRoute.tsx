import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";

export default function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();

  // 🔥 IMPORTANT: älä renderöi mitään ennen kuin data on valmis
  if (authLoading || roleLoading) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        Loading...
      </div>
    );
  }

  // 🔥 EI USER → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 ROLE PUUTTUU → älä blokkaa heti (estää blank screen bugit)
  if (!role) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        Loading role...
      </div>
    );
  }

  // 🔥 EI ADMIN → redirect
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // OK → render children routes
  return <Outlet />;
}