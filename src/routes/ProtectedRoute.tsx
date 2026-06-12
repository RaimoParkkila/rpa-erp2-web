import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  console.log("🔐 AUTH RAW USER:", user);

  if (loading) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  // 🔥 HARD VALIDATION: oikea Supabase auth user on aina string UUID
  const isValidUser =
    user &&
    typeof user === "object" &&
    typeof (user as any).id === "string" &&
    typeof (user as any).email === "string";

  if (!isValidUser) {
    console.warn("🚨 INVALID AUTH USER BLOCKED:", user);

    return (
      <div style={{ color: "white", padding: 20 }}>
        <h3>Auth error</h3>
        <p>Invalid session data detected.</p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return <Outlet />;
}