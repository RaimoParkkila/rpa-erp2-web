import { useEffect, useState } from "react";
import type { InvoiceForm } from "@modules/invoices/types/InvoiceTypes";
import type { Customer } from "@modules/invoices/types/CustomerTypes";
import { supabase } from "@services/supabase";

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
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] =
    useState<"Paid" | "Pending" | "Overdue">("Pending");

  const [total, setTotal] = useState<number>(0);

  // ---------------- DEBUG ----------------
  useEffect(() => {
    console.log("INVOICE MODAL initialData:", initialData);
  }, [initialData]);

  // ---------------- FETCH CUSTOMERS ----------------
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("rpa_customer")
        .select("id, firstname")
        .order("id");

      if (!error && data) setCustomers(data);
      else console.error(error);
    };

    fetchCustomers();
  }, []);

  // ---------------- SYNC INITIAL DATA ----------------
  useEffect(() => {
    if (!initialData) {
      setCustomerId("");
      setDate("");
      setStatus("Pending");
      setTotal(0);
      return;
    }

    setCustomerId(
      initialData.rpa_customer_id ? String(initialData.rpa_customer_id) : ""
    );

    // 🔥 FIX: date fallback (Supabase timestamp vs date-only)
    const safeDate = initialData.date
      ? String(initialData.date).substring(0, 10)
      : "";

    setDate(safeDate);

    setStatus(initialData.status ?? "Pending");

    // 🔥 FIX: DO NOT overwrite real totals with undefined/null
    setTotal(
      (initialData as any).total ??
      (initialData as any).subtotal ??
      0
    );
  }, [initialData]);

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

  if (!visible) return null;

  // ---------------- SAVE ----------------
  const handleSave = () => {
    const fullInvoice = {
      ...(initialData as any),
      rpa_customer_id: Number(customerId),
      date,
      status,
    };

    onSave(fullInvoice);
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
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          background: "white",
          padding: 20,
          borderRadius: 10,
        }}
      >
        {initialData ? "Edit Invoice" : "Add Invoice"}

        {/* DEBUG */}
        <pre style={{ fontSize: 11, background: "#111", color: "#0f0", padding: 10 }}>
          {JSON.stringify({ customerId, date, status, total, initialData }, null, 2)}
        </pre>

        {/* CUSTOMER */}
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.firstname}
            </option>
          ))}
        </select>

        <br />

        {/* DATE */}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <br />

        {/* STATUS */}
        <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>

        {/* TOTAL (READ ONLY DEBUG) */}
        <div style={{ marginTop: 10 }}>
          Total: <b>{total}</b>
        </div>

        <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}