import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase";
import { useNavigate } from "react-router-dom";
import { formatDateES } from "../../../utils/date";

type WholesaleItem = {
  id: number;
  name: string;
  category: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  activated_date: string;
};

export default function Wholesale(): JSX.Element {
  const [items, setItems] = useState<WholesaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_wholesale")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setItems((data as WholesaleItem[]) || []);
    }

    setLoading(false);
  }

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #2a2a2a",
    padding: 15,
    borderRadius: 10,
  };

  const td: React.CSSProperties = {
    padding: 10,
    fontSize: 13,
  };

  const filteredItems = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.city?.toLowerCase().includes(q) ||
      i.country?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ color: "white" }}>
      {/* HEADER */}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigate("/wholesale/new")}>
          + New Wholesale Item
        </button>
      </div>

      <div style={{ marginTop: 18, opacity: 0.6 }}>
        Wholesale customers & distribution partners
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search name, city, country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginTop: 10,
          padding: 8,
          width: "100%",
          maxWidth: 320,
          borderRadius: 6,
          border: "1px solid #333",
          background: "#111",
          color: "white",
        }}
      />

      {/* KPI ROW */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 15,
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Partners</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {items.length}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Countries</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {new Set(items.map((i) => i.country)).size}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Cities</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {new Set(items.map((i) => i.city)).size}
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ opacity: 0.6, marginTop: 20 }}>
          Loading wholesale data...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div style={{ overflowX: "auto", marginTop: 20 }}>
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
                <th style={td}>Name</th>
                <th style={td}>City</th>
                <th style={td}>Country</th>
                <th style={td}>Activated</th>
                <th style={td}>Email</th>
                <th style={td}>Phone</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => navigate(`/wholesale/${i.id}`)}
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
                  <td style={td}>{i.name}</td>
                  <td style={td}>{i.city}</td>
                  <td style={td}>{i.country}</td>
                  <td style={td}>
                    {i.activated_date
                      ? formatDateES(i.activated_date)
                      : "-"}
                  </td>
                  <td style={td}>{i.email}</td>
                  <td style={td}>{i.phone1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}