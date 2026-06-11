import { useEffect } from "react";
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
  } = useCrud<Customer>({
    domain: "customers",
  });

  useEffect(() => {
    getAll();
  }, []);

  return (
    <div style={{ color: "white" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Customers</h1>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => navigate("/customers/new")}
          >
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
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                style={{
                  background: i % 2 === 0 ? "#121212" : "#0f0f0f",
                  cursor: "pointer",
                }}
              >
                <td style={td}>{c.firstname}</td>
                <td style={td}>{c.email}</td>
                <td style={td}>{c.city}</td>
                <td style={td}>{c.country}</td>
                <td style={td}>{c.phone1}</td>
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