import { useParams } from "react-router-dom";
import { useCustomerDetail } from "../hooks/useCustomerDetail";

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = Number(id);

  const {
    data,
    form,
    setForm,
    invoices,
    loading,
    save,
    handleCreateInvoice,
    handleQuickInvoice,
  } = useCustomerDetail(customerId);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fi-FI");

  const cellStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 12px",
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "Draft":
        return {
          background: "#555",
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
        };
      case "Sent":
        return {
          background: "#d97706",
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
        };
      case "Paid":
        return {
          background: "#16a34a",
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
        };
      default:
        return {
          background: "#333",
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          fontSize: 12,
        };
    }
  };

  const idLinkStyle: React.CSSProperties = {
    color: "#60a5fa",
    textDecoration: "underline",
    cursor: "pointer",
  };

if (loading) return <p>Loading...</p>;
if (!data) return <p>No customer found</p>;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Customer #{data.id}</h1>

      {/* CUSTOMER INFO */}
      <p><b>Name:</b> {data.firstname}</p>
      <p><b>Email:</b> {data.email}</p>
      <p><b>City:</b> {data.city}</p>
      <p><b>Country:</b> {data.country}</p>
      <p><b>Phone:</b> {data.phone1}</p>

      {/* ACTIONS */}
      <button onClick={save}>Save</button>
      <button onClick={handleCreateInvoice}>+ Create Invoice</button>
      <button onClick={handleQuickInvoice}>⚡ Quick Invoice</button>

      {/* INVOICES */}
      <h2 style={{ marginTop: 30 }}>Invoices</h2>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          style={{
            width: "650px",
            background: "#111",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            padding: 12,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
            }}
          >
            <thead style={{ borderBottom: "1px solid #333" }}>
              <tr>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Date</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() =>
                    (window.location.href = `/invoices/${inv.id}`)
                  }
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1a1a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={cellStyle}>
                    <span style={idLinkStyle}>#{inv.id}</span>
                  </td>

                  <td style={cellStyle}>
                    <span style={getStatusStyle(inv.status)}>
                      {inv.status}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    {formatDate(inv.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}