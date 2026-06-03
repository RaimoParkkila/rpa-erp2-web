import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
 console.log("AUTH USER:", user);
  if (loading) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
   
  }

  return <Outlet />;
}