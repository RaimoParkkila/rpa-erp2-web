import React, { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  initialData: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<any> | void;
};

const emptyForm = {
  customer: "",
  rpa_customer_id: "",
  date: "",
  status: "Pending",
  total: 0,
};

// ---------------- STATUS MAP ----------------
const mapStatusReverse = (status: string) => {
  switch (status) {
    case "Pending":
      return "DRAFT";
    case "Paid":
      return "PAID";
    case "Overdue":
      return "OVERDUE";
    default:
      return "DRAFT";
  }
};

export default function InvoiceModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // ---------------- SYNC ----------------
  useEffect(() => {
    if (!isOpen) return;

    setForm({
      customer: initialData?.customer ?? "",
      rpa_customer_id: initialData?.rpa_customer_id
        ? String(initialData.rpa_customer_id)
        : "",
      date: initialData?.date ? initialData.date.split("T")[0] : "",
      status: initialData?.status ?? "Pending",
      total: Number(initialData?.total ?? 0),
    });
  }, [initialData, isOpen]);

  // ---------------- CHANGE ----------------
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        customer: form.customer,
        rpa_customer_id: Number(form.rpa_customer_id),
        date: form.date,
        status: mapStatusReverse(form.status), // 🔥 CRITICAL FIX
        total: Number(form.total),
      };

      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ background: "#111", padding: 20, borderRadius: 10 }}>
      <h3>Invoice</h3>

      {/* CUSTOMER */}
      <div>
        <label>Customer</label>
        <div style={{ padding: 8, border: "1px solid #333", borderRadius: 6 }}>
          {form.customer || "-"}
        </div>
      </div>

      {/* CUSTOMER ID */}
      <div>
        <label>Customer ID</label>
        <div style={{ padding: 8, border: "1px solid #333", borderRadius: 6 }}>
          {form.rpa_customer_id || "-"}
        </div>
      </div>

      {/* DATE */}
      <input
        value={form.date}
        onChange={(e) => handleChange("date", e.target.value)}
        type="date"
      />

      {/* STATUS */}
      <select
        value={form.status}
        onChange={(e) => handleChange("status", e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
        <option value="Overdue">Overdue</option>
      </select>

      {/* TOTAL */}
      <div style={{ marginTop: 10, opacity: 0.7 }}>
        Total: {form.total}
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: 10 }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}