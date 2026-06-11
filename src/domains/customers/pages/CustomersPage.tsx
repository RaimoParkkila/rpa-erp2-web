import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type Customer = {
  id: number;
  firstname: string;
  email: string;
  city: string;
  country: string;
  phone1: string;
};

export default function Customers() {
  const navigate = useNavigate();

  const {
    list: customers,
    loading,
    getAll,
    update,
    remove,
  } = useCrud<Customer>({
    domain: "customers",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  useEffect(() => {
    getAll();
  }, []);

  function startEdit(c: Customer) {
    setEditingId(c.id);
    setEditForm({
      firstname: c.firstname,
      email: c.email,
      city: c.city,
      country: c.country,
      phone1: c.phone1,
    });
  }

  function setField(field: keyof Customer, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveEdit(id: number) {
    await update(id, editForm);
    setEditingId(null);
    setEditForm({});
    await getAll();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Delete this customer?");
    if (!ok) return;

    await remove(id);
    await getAll();
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

  return (
    <div style={{ color: "white" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Customers</h1>

        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate("/customers/new")}>
            + New Customer
          </button>
        </div>

        <div style={{ marginTop: 18, opacity: 0.6 }}>
          Customer database & contact registry
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#111",
            color: "white",
          }}
        >
          <thead style={{ background: "#1a1a1a" }}>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>City</th>
              <th style={th}>Country</th>
              <th style={th}>Phone</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => {
              const isEditing = editingId === c.id;

              return (
                <tr
                  key={c.id}
                  style={{
                    background: i % 2 === 0 ? "#121212" : "#0f0f0f",
                  }}
                >
                  {/* NAME */}
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.firstname || ""}
                        onChange={(e) =>
                          setField("firstname", e.target.value)
                        }
                      />
                    ) : (
                      c.firstname
                    )}
                  </td>

                  {/* EMAIL */}
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.email || ""}
                        onChange={(e) => setField("email", e.target.value)}
                      />
                    ) : (
                      c.email
                    )}
                  </td>

                  {/* CITY */}
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.city || ""}
                        onChange={(e) => setField("city", e.target.value)}
                      />
                    ) : (
                      c.city
                    )}
                  </td>

                  {/* COUNTRY */}
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.country || ""}
                        onChange={(e) => setField("country", e.target.value)}
                      />
                    ) : (
                      c.country
                    )}
                  </td>

                  {/* PHONE */}
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.phone1 || ""}
                        onChange={(e) => setField("phone1", e.target.value)}
                      />
                    ) : (
                      c.phone1
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td style={td}>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(c.id)}>
                          Save
                        </button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)}>
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ marginLeft: 8, color: "red" }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}