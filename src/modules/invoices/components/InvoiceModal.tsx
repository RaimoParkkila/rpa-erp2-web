import React, { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  initialData: any | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
};

export default function InvoiceModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: Props) {

  const emptyForm = {
    customer: "",
    rpa_customer_id: "",
    date: "",
    status: "Pending",
    total: 0,
  };

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // ✅ SYNC: props → state (FULL FIX)
  useEffect(() => {
    if (!isOpen) return;

    setForm({
      customer: initialData?.customer ?? "",
      rpa_customer_id: initialData?.rpa_customer_id ?? "",
      date: initialData?.date ?? "",
      status: initialData?.status ?? "Pending",
      total: initialData?.total ?? 0,
    });

  }, [initialData, isOpen]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ background: "#111", padding: 20, borderRadius: 10 }}>
      <h3>Invoice</h3>

      <input
        value={form.customer}
        onChange={(e) => handleChange("customer", e.target.value)}
        placeholder="Customer"
      />

      <input
        value={form.date}
        onChange={(e) => handleChange("date", e.target.value)}
        type="date"
      />

      <select
        value={form.status}
        onChange={(e) => handleChange("status", e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
        <option value="Overdue">Overdue</option>
      </select>

      {/* optional display only */}
      <div style={{ marginTop: 10, opacity: 0.7 }}>
        Total: {form.total}
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave} disabled={saving}>
          Save
        </button>
      </div>
    </div>
  );
}