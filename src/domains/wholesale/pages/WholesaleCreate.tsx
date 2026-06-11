import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type Wholesale = {
  companyname: string;
  contactperson: string;
  streetaddress: string;
  zip_code: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  www_page: string;
  activated_date: string;
};

export default function WholesaleCreate(): JSX.Element {
  const navigate = useNavigate();

  const { create } = useCrud<Wholesale>({
    domain: "wholesale",
    enableTenant: false,
  });

  const [form, setForm] = useState<Partial<Wholesale>>({
    companyname: "",
    contactperson: "",
    streetaddress: "",
    zip_code: "",
    city: "",
    country: "",
    email: "",
    phone1: "",
    www_page: "",
    activated_date: "",
  });

  function setField(field: keyof Wholesale, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave() {
    const result = await create(form);

    if (!result) {
      alert("Save failed (check console)");
      return;
    }

    navigate("/wholesale");
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
      <h1>New Wholesale</h1>

      <div style={{ marginTop: 20 }}>
        <label>Company Name</label>
        <input
          style={inputStyle}
          value={form.companyname || ""}
          onChange={(e) => setField("companyname", e.target.value)}
        />

        <label>Contact Person</label>
        <input
          style={inputStyle}
          value={form.contactperson || ""}
          onChange={(e) => setField("contactperson", e.target.value)}
        />

        <label>Street Address</label>
        <input
          style={inputStyle}
          value={form.streetaddress || ""}
          onChange={(e) => setField("streetaddress", e.target.value)}
        />

        <label>ZIP Code</label>
        <input
          style={inputStyle}
          value={form.zip_code || ""}
          onChange={(e) => setField("zip_code", e.target.value)}
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

        <label>Website</label>
        <input
          style={inputStyle}
          value={form.www_page || ""}
          onChange={(e) => setField("www_page", e.target.value)}
        />

        <label>Activated Date</label>
        <input
          type="date"
          style={inputStyle}
          value={form.activated_date || ""}
          onChange={(e) => setField("activated_date", e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => navigate("/wholesale")}>
          Cancel
        </button>
      </div>
    </div>
  );
}