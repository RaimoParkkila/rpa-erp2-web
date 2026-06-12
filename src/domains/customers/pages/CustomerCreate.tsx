import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type CustomerForm = {
  firstname: string;
  email: string;
  city: string;
  country: string;
  phone1: string;
};

export default function CustomerCreate() {
  const navigate = useNavigate();

  const { create } = useCrud({
    domain: "customers",
    enableTenant: false,
  });

  const [form, setForm] = useState<CustomerForm>({
    firstname: "",
    email: "",
    city: "",
    country: "",
    phone1: "",
  });

  function updateField(field: keyof CustomerForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    const result = await create(form);

    if (result) {
      navigate("/customers");
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #333",
    background: "#111",
    color: "white",
    width: "100%",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "#1e1e1e",
    color: "white",
    cursor: "pointer",
  };

  const primaryButton: React.CSSProperties = {
    ...buttonStyle,
    background: "#00ffcc",
    color: "#000",
    fontWeight: "bold",
  };

  return (
    <div style={{ padding: 20, color: "white", maxWidth: 600 }}>
      <h1 style={{ marginBottom: 15 }}>Create Customer</h1>

      <div
        style={{
          display: "grid",
          gap: 10,
          background: "#111",
          padding: 15,
          borderRadius: 10,
          border: "1px solid #2a2a2a",
        }}
      >
        <input
          style={inputStyle}
          placeholder="Firstname"
          value={form.firstname}
          onChange={(e) => updateField("firstname", e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Country"
          value={form.country}
          onChange={(e) => updateField("country", e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Phone"
          value={form.phone1}
          onChange={(e) => updateField("phone1", e.target.value)}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button style={primaryButton} onClick={handleSave}>
            Save Customer
          </button>

          <button style={buttonStyle} onClick={() => navigate("/customers")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}