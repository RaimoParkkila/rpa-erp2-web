import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type StorageBranch = {
  id: number;
  branchofficename: string;
  streetaddress: string;
  zipcode: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  activated_date: string;
};

export default function StorageDetail(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data,
    form,
    setForm,
    loading,
    getById,
    update,
    remove,
  } = useCrud({
    domain: "storage",
    enableTenant: false,
  });

  useEffect(() => {
    if (id) {
      getById(Number(id));
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!data || !form) return <div>Storage location not found</div>;

  const handleSave = async () => {
    await update(data.id, form);
    alert("Saved");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this storage location?"
    );

    if (!confirmed) return;

    await remove(data.id);
    navigate("/storage");
  };

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
    <div style={{ marginTop: 20 }}>
      <label>Branch Name</label>
      <input
        style={inputStyle}
        value={form.branchofficename || ""}
        onChange={(e) =>
          setForm({
            ...form,
            branchofficename: e.target.value,
          })
        }
      />

      <label>Street Address</label>
      <input
        style={inputStyle}
        value={form.streetaddress || ""}
        onChange={(e) =>
          setForm({
            ...form,
            streetaddress: e.target.value,
          })
        }
      />

      <label>ZIP Code</label>
      <input
        style={inputStyle}
        value={form.zipcode || ""}
        onChange={(e) =>
          setForm({
            ...form,
            zipcode: e.target.value,
          })
        }
      />

      <label>City</label>
      <input
        style={inputStyle}
        value={form.city || ""}
        onChange={(e) =>
          setForm({
            ...form,
            city: e.target.value,
          })
        }
      />

      <label>Country</label>
      <input
        style={inputStyle}
        value={form.country || ""}
        onChange={(e) =>
          setForm({
            ...form,
            country: e.target.value,
          })
        }
      />

      <label>Email</label>
      <input
        style={inputStyle}
        value={form.email || ""}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <label>Phone</label>
      <input
        style={inputStyle}
        value={form.phone1 || ""}
        onChange={(e) =>
          setForm({
            ...form,
            phone1: e.target.value,
          })
        }
      />

      <label>Activated Date</label>
      <input
        type="date"
        style={inputStyle}
        value={form.activated_date || ""}
        onChange={(e) =>
          setForm({
            ...form,
            activated_date: e.target.value,
          })
        }
      />

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={handleSave}>Save</button>

        <button onClick={handleDelete}>Delete</button>

        <button onClick={() => navigate("/storage")}>
          Back
        </button>
      </div>
    </div>
  );
}