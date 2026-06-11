import { useEffect, useState } from "react";
import { supabase } from "@services/supabase";
import { useNavigate } from "react-router-dom";

type Invoice = {
  id: number;
  status: string;
  rpa_customer_id: number;
};

type Customer = {
  id: number;
};

type InvoiceLine = {
  price: number;
  amount: number;
  rpa_headerofinvoice_id: number;
};

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: invData } = await supabase
      .from("rpaheaderofinvoice")
      .select("id, status, rpa_customer_id");

    const { data: custData } = await supabase
      .from("rpa_customer")
      .select("id");

    const { data: lineData } = await supabase
      .from("rpa_invoice_line")
      .select("price, amount, rpa_headerofinvoice_id");

    setInvoices(invData || []);
    setCustomers(custData || []);
    setLines(lineData || []);
  }

  const draft = invoices.filter(i => i.status === "DRAFT").length;
  const sent = invoices.filter(i => i.status === "SENT").length;
  const paid = invoices.filter(i => i.status === "PAID").length;

  const paidInvoiceIds = invoices
    .filter(i => i.status === "PAID")
    .map(i => i.id);

  const revenue = lines
    .filter(l => paidInvoiceIds.includes(l.rpa_headerofinvoice_id))
    .reduce((sum, l) => sum + l.price * l.amount, 0);

  const customerSpend: Record<number, number> = {};

  lines.forEach(line => {
    const invoice = invoices.find(
      i => i.id === line.rpa_headerofinvoice_id
    );

    if (!invoice || invoice.status !== "PAID") return;

    customerSpend[invoice.rpa_customer_id] =
      (customerSpend[invoice.rpa_customer_id] || 0) +
      line.price * line.amount;
  });

  const topCustomers = Object.entries(customerSpend)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 3);

  const card = (title: string, value: any, onClick?: () => void) => (
    <div
      onClick={onClick}
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #333",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: "24px", marginTop: "5px" }}>
        {value}
      </div>
    </div>
  );

  const statusBadge = (status: string) => {
    const baseStyle: React.CSSProperties = {
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
    };

    switch (status) {
      case "DRAFT":
        return (
          <span style={{ ...baseStyle, background: "#2a2a2a", color: "#aaa" }}>
            DRAFT
          </span>
        );
      case "SENT":
        return (
          <span style={{ ...baseStyle, background: "#1e3a5f", color: "#4da3ff" }}>
            SENT
          </span>
        );
      case "PAID":
        return (
          <span style={{ ...baseStyle, background: "#1f3d2b", color: "#3dff9a" }}>
            PAID
          </span>
        );
      default:
        return (
          <span style={{ ...baseStyle, background: "#333", color: "#fff" }}>
            {status}
          </span>
        );
    }
  };

  const total = invoices.length;

  return (
    <div style={{ color: "white" }}>
      <h1>ERP Dashboard</h1>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {card("Total Invoices", total, () => navigate("/invoices"))}
        {card("Draft", draft)}
        {card("Sent", sent)}
        {card("Paid", paid)}
        {card("Customers", customers.length)}
        {card("Revenue (€)", revenue.toFixed(2))}
      </div>

      {/* STATUS PREVIEW */}
      <div style={{ marginTop: "20px" }}>
        <h3>Status Preview</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {statusBadge("DRAFT")}
          {statusBadge("SENT")}
          {statusBadge("PAID")}
        </div>
      </div>

      {/* TOP CUSTOMERS */}
      <div style={{ marginTop: "30px" }}>
        <h2>Top Customers</h2>

        {topCustomers.length === 0 && <p>No paid invoices yet</p>}

        {topCustomers.map(([customerId, amount]) => (
          <div
            key={customerId}
            style={{
              padding: "10px",
              background: "#1e1e1e",
              marginBottom: "8px",
              borderRadius: "6px",
            }}
          >
            Customer #{customerId} — €{Number(amount).toFixed(2)}
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginTop: "30px" }}>
        <h2>Quick Actions</h2>

        <button onClick={() => navigate("/shop")}>Go to Shop</button>
        <button onClick={() => navigate("/invoices")}>View Invoices</button>
        <button onClick={() => navigate("/customers")}>View Customers</button>
      </div>
    </div>
  );
}