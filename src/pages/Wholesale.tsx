import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

type Wholesale = {
  id: number;
  zipcode: string;
  activated_date: string;
  branchofficename: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  streetaddress: string;
};

export default function Wholesale() {
  const [wholesales, setWholesales] = useState<Wholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWholesales();
  }, []);

  async function fetchWholesales() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_wholesale")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setWholesales((data as Wholesale[]) || []);
    }

    setLoading(false);
  }

  return (
    <div style={{ color: "white" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Wholesale</h1>

        <div style={{ marginTop: 18, opacity: 0.6 }}>
          Branch offices & wholesale distribution locations
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
              <th style={th}>City</th>
              <th style={th}>Country</th>
              <th style={th}>ZIP</th>
              <th style={th}>Activated</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
            </tr>
          </thead>

          <tbody>
            {wholesales.map((w, i) => (
              <tr
                key={w.id}
                onClick={() => navigate(`/wholesale/${w.id}`)}
                style={{
                  background: i % 2 === 0 ? "#121212" : "#0f0f0f",
                  cursor: "pointer",
                  transition: "0.15s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#1a1a1a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    i % 2 === 0 ? "#121212" : "#0f0f0f")
                }
              >
                <td style={td}>{w.branchofficename}</td>
                <td style={td}>{w.city}</td>
                <td style={td}>{w.country}</td>
                <td style={td}>{w.zipcode}</td>
                <td style={td}>{w.activated_date}</td>
                <td style={td}>{w.email}</td>
                <td style={td}>{w.phone1}</td>
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