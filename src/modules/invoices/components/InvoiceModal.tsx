import { useEffect, useState } from "react";
import type { InvoiceForm } from "@modules/invoices/types/InvoiceTypes";
import type { Customer } from "@modules/invoices/types/CustomerTypes";
import { supabase } from "@services/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceForm) => void;
  initialData?: any | null;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [visible, setVisible] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] =
    useState<"Paid" | "Pending" | "Overdue">("Pending");

  const [total, setTotal] = useState(0);

  // ---------------- OPEN / CLOSE ----------------
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setVisible(false), 180);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ---------------- ESC ----------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // ---------------- CUSTOMERS ----------------
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from("rpa_customer")
        .select("id, firstname")
        .order("id");

      if (data) setCustomers(data);
    };

    fetchCustomers();
  }, []);

  // ---------------- INITIAL DATA SYNC (CLEAN) ----------------
  useEffect(() => {
    const computedTotal =
      initialData?.total ??
      initialData?.subtotal ??
      initialData?.snapshot?.totals?.total ??
      0;

    alert(
      `total: ${initialData?.total}\n` +
      `subtotal: ${initialData?.subtotal}\n` +
      `snapshotTotal: ${initialData?.snapshot?.totals?.total}\n` +
      `computedTotal: ${computedTotal}`
    );

    setTotal(Number(computedTotal));
  }, [initialData]);


  if (!visible) return null;

  const handleSave = () => {
    onSave({
      ...(initialData as any),
      rpa_customer_id: Number(customerId),
      date,
      status,
    });

    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "white",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#0f0f0f",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          color: "white",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {initialData ? "Edit Invoice" : "New Invoice"}
          </div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Invoice management panel
          </div>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 15,
          }}
        >
          {/* CUSTOMER */}
          <div>
            <div style={labelStyle}>Customer</div>
            <select
              style={inputStyle}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.firstname}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div>
            <div style={labelStyle}>Date</div>
            <input
              style={inputStyle}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div>
            <div style={labelStyle}>Status</div>
            <select
              style={inputStyle}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* TOTAL */}
          <div>
            <div style={labelStyle}>Total</div>
            <div
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              {Number(total).toFixed(2)}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#111",
              color: "white",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#1f1f1f",
              color: "white",
              fontWeight: 600,
            }}
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}