import { useEffect, useState } from "react";
import type { InvoiceForm } from "../types/InvoiceTypes";
import type { Customer } from "../types/CustomerTypes";
import { supabase } from "../../../services/supabase";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceForm) => void;
  initialData?: InvoiceForm | null;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [status, setStatus] =
    useState<"Paid" | "Pending" | "Overdue">("Pending");


  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("rpa_customer")
        .select("id, firstname")
        .order("id");

      if (!error && data) {
        setCustomers(data);
      }
    };

    fetchCustomers();
  }, []);

  // Sync edit/create data
  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.rpa_customer_id ?? "");
      setDate(initialData.date ?? "");
      setStatus(initialData.status ?? "Pending");
    } else {
      setCustomerId("");
      setDate("");
      setStatus("Pending");
    }
  }, [initialData]);

  // open/close animation control
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

  // ESC close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!visible) return null;

  const handleSave = () => {
    onSave({
      rpa_customer_id: Number(customerId),
      date,
      status,
    });

    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: isOpen ? 1 : 0,
        transition: "opacity 180ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          background: "white",
          padding: 20,
          borderRadius: 10,
          transform: isOpen ? "scale(1)" : "scale(0.95)",
          transition: "transform 180ms ease",
        }}
      >
        <h3>{initialData ? "Edit Invoice" : "Add Invoice"}</h3>

        {/* CUSTOMER ID (later dropdown voidaan tehdä) */}
        <select
          value={customerId}
          onChange={(e) => setCustomerId(Number(e.target.value))}
        >
          <option value="">Select customer</option>

          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstname}
            </option>
          ))}
        </select>

        <br />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <br />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>

        <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}