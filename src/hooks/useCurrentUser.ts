import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

type AppUser = {
  id: string;
  email: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
}