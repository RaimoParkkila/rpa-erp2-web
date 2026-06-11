import { useEffect, useState } from "react";
import { supabase } from "@services/supabase";

type AdminUser = {
  id: string;
  email?: string;
  role: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    // 🔥 fallback-safe query (ei kaadu vaikka email puuttuu view:stä)
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, role, email");

    if (error) {
      console.error(error);
      setError("Failed to load users");
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  }

  async function changeRole(id: string, role: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Failed to update role");
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  }

  return (
    <div style={{ color: "white" }}>
      <h2>Admin Panel</h2>
      <p style={{ opacity: 0.6 }}>User management system</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && users.length === 0 && (
        <p style={{ opacity: 0.6 }}>No users found</p>
      )}

      {!loading && users.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Email / ID</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.email ?? u.id.slice(0, 8)}
                </td>

                <td>{u.role}</td>

                <td>
                  {u.role !== "admin" ? (
                    <button onClick={() => changeRole(u.id, "admin")}>
                      Make admin
                    </button>
                  ) : (
                    <button onClick={() => changeRole(u.id, "user")}>
                      Remove admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}