import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // ei kirjautunut → login
  if (!user) return <Navigate to="/login" replace />;

  // ⚠️ oletus: role tulee user.user_metadata tai profiles-taulusta
  const role = user?.user_metadata?.role;

  // ei admin → estä pääsy
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}