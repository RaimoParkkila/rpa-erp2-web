import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { formatDateES } from "../utils/date";

type StorageBranch = {
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

export default function Storage() {
  const [branches, setBranches] = useState<StorageBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_storagebranchoffice")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setBranches((data as StorageBranch[]) || []);
    }

    setLoading(false);
  }

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #2a2a2a",
    padding: 15,
    borderRadius: 10,
  };

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: 10,
    fontSize: 12,
    opacity: 0.7,
  };

  const td: React.CSSProperties = {
    padding: 10,
    fontSize: 13,
  };

  return (
    <div style={{ color: "white" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Storage</h1>

        <div style={{ marginTop: 18, opacity: 0.6 }}>
          Branch offices & warehouse locations
        </div>
      </div>

      {/* KPI ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Branches</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {branches.length}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Countries</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {new Set(branches.map((b) => b.country)).size}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Cities</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {new Set(branches.map((b) => b.city)).size}
          </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#0f0f0f",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#1a1a1a" }}>
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
              {branches.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/storage/${b.id}`)}
                  style={{
                    borderTop: "1px solid #222",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1a1a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={td}>{b.branchofficename}</td>
                  <td style={td}>{b.city}</td>
                  <td style={td}>{b.country}</td>
                  <td style={td}>{b.zipcode}</td>

                  <td style={td}>
                    {b.activated_date
                      ? formatDateES(b.activated_date)
                      : "-"}
                  </td>

                  <td style={td}>{b.email}</td>
                  <td style={td}>{b.phone1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}