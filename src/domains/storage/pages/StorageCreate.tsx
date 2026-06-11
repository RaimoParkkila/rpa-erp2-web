import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type StorageBranch = {
  branchofficename: string;
  streetaddress: string;
  zipcode: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  activated_date: string;
};

export default function StorageCreate(): JSX.Element {
  const navigate = useNavigate();

  const { create } = useCrud({
    domain: "storage",
    enableTenant: false,
  });

  const [form, setForm] = useState<Partial<StorageBranch>>({
    branchofficename: "",
    streetaddress: "",
    zipcode: "",
    city: "",
    country: "",
    email: "",
    phone1: "",
    activated_date: "",
  });

  function setField(field: keyof StorageBranch, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    await create(form);
    navigate("/storage");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #333",
    background: "#111",
    color: "white",
  };

  return (
    <div style={{ color: "white" }}>
      <h1>New Storage Branch</h1>

      <div style={{ marginTop: 20 }}>
        <label>Branch Name</label>
        <input
          style={inputStyle}
          value={form.branchofficename || ""}
          onChange={(e) =>
            setField("branchofficename", e.target.value)
          }
        />

        <label>Street Address</label>
        <input
          style={inputStyle}
          value={form.streetaddress || ""}
          onChange={(e) =>
            setField("streetaddress", e.target.value)
          }
        />

        <label>ZIP Code</label>
        <input
          style={inputStyle}
          value={form.zipcode || ""}
          onChange={(e) => setField("zipcode", e.target.value)}
        />

        <label>City</label>
        <input
          style={inputStyle}
          value={form.city || ""}
          onChange={(e) => setField("city", e.target.value)}
        />

        <label>Country</label>
        <input
          style={inputStyle}
          value={form.country || ""}
          onChange={(e) => setField("country", e.target.value)}
        />

        <label>Email</label>
        <input
          style={inputStyle}
          value={form.email || ""}
          onChange={(e) => setField("email", e.target.value)}
        />

        <label>Phone</label>
        <input
          style={inputStyle}
          value={form.phone1 || ""}
          onChange={(e) => setField("phone1", e.target.value)}
        />

        <label>Activated Date</label>
        <input
          type="date"
          style={inputStyle}
          value={form.activated_date || ""}
          onChange={(e) =>
            setField("activated_date", e.target.value)
          }
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={handleSave}>Save</button>

        <button onClick={() => navigate("/storage")}>
          Cancel
        </button>
      </div>
    </div>
  );
}