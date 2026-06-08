import { useEffect, useState } from "react";
import { supabase } from "@services/supabase";

type UserRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("profiles") // tai "users" riippuen sun taulusta
      .select("id, email, role, created_at");

    if (error) {
      console.error(error);
      setError("Failed to load users");
      setLoading(false);
      return;
    }

    setUsers((data as UserRow[]) || []);
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
      <h1>Admin Panel</h1>
      <p style={{ opacity: 0.6 }}>
        User management & system control
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {error}
        </div>
      )}

      {loading && <p>Loading...</p>}

      {!loading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#111",
            color: "white",
            marginTop: 20,
          }}
        >
          <thead style={{ background: "#1a1a1a" }}>
            <tr>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Created</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, i) => (
              <tr
                key={u.id}
                style={{
                  background: i % 2 === 0 ? "#121212" : "#0f0f0f",
                }}
              >
                <td style={td}>{u.email}</td>

                <td style={td}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      background:
                        u.role === "admin"
                          ? "#3a1f1f"
                          : "#1f2a3a",
                      color:
                        u.role === "admin"
                          ? "#ff6b6b"
                          : "#4da3ff",
                    }}
                  >
                    {u.role}
                  </span>
                </td>

                <td style={td}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>

                <td style={td}>
                  {u.role !== "admin" ? (
                    <button
                      onClick={() => changeRole(u.id, "admin")}
                      style={btn}
                    >
                      Make admin
                    </button>
                  ) : (
                    <button
                      onClick={() => changeRole(u.id, "user")}
                      style={btn}
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

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #333",
  color: "#aaa",
  fontSize: "12px",
  textTransform: "uppercase",
};

const td: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #222",
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#00ffcc",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};