import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    async function loadRole() {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role ?? "user");
      setLoading(false);
    }

    loadRole();
  }, [user]);

  return { role, loading };
}