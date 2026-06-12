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

  // 🔥 shared styles
  const buttonStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "#111",
    color: "white",
    cursor: "pointer",
    minWidth: 120,
    textAlign: "center",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
    background: "#0f0f0f",
    borderRadius: 10,
    overflow: "hidden",
  };

  const thTd: React.CSSProperties = {
    padding: 10,
    fontSize: 13,
    borderBottom: "1px solid #222",
  };

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
        <table style={tableStyle}>
          <thead>
            <tr style={{ textAlign: "left", background: "#1a1a1a" }}>
              <th style={thTd}>Email / ID</th>
              <th style={thTd}>Role</th>
              <th style={thTd}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={thTd}>
                  {u.email ?? u.id.slice(0, 8)}
                </td>

                <td style={thTd}>{u.role}</td>

                <td style={thTd}>
                  {u.role !== "admin" ? (
                    <button
                      style={buttonStyle}
                      onClick={() => changeRole(u.id, "admin")}
                    >
                      Make admin
                    </button>
                  ) : (
                    <button
                      style={buttonStyle}
                      onClick={() => changeRole(u.id, "user")}
                    >
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