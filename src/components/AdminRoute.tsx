import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";

export default function AdminRoute() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}