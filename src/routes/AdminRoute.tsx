import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      console.log("ADMIN ROUTE USER:", user);

      if (!user) {
        console.log("NO USER FOUND");
        setRoleLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("PROFILE QUERY DATA:", data);
      console.log("PROFILE QUERY ERROR:", error);

      setRole(data?.role ?? null);
      setRoleLoading(false);
    }
console.log("CURRENT USER:", user);
console.log("CURRENT USER ID:", user?.id);
console.log("CURRENT USER EMAIL:", user?.email);
    fetchRole();
  }, [user]);

  console.log("AUTH LOADING:", loading);
  console.log("ROLE LOADING:", roleLoading);
  console.log("ROLE:", role);
  console.log("LOCAL STORAGE ROLE:", localStorage.getItem("role"));

  if (loading || roleLoading) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  if (!user) {
    console.log("REDIRECT -> /login (NO USER)");
    return <Navigate to="/login" replace />;
  }

  if (role === undefined || role === null) {
    console.log("ROLE IS NULL OR UNDEFINED");
    return <div style={{ color: "white" }}>Role not found</div>;
  }

  if (role !== "admin") {
    console.log("REDIRECT -> / (NOT ADMIN)", role);
    return <Navigate to="/" replace />;
  }

  console.log("ADMIN ACCESS GRANTED");

  return <Outlet />;
}