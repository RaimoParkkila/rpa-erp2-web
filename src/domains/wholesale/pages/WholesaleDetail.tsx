import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase";

type Wholesale = {
  id: number;
  companyname: string;
  zip_code: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  streetaddress: string;
  contactperson: string;
  www_page: string;
  wholesale_id: number;
};

export default function WholesaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<Wholesale | null>(null);
  const [form, setForm] = useState<Wholesale | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_wholesale")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error(error);
      setItem(null);
    } else {
      setItem(data);
      setForm(data);
    }

    setLoading(false);
  }

  async function save() {
    if (!form || !id) return;

    const { error } = await supabase
      .from("rpa_wholesale")
      .update({
        companyname: form.companyname,
        city: form.city,
        country: form.country,
        zip_code: form.zip_code,
        email: form.email,
        phone1: form.phone1,
        streetaddress: form.streetaddress,
        contactperson: form.contactperson,
        www_page: form.www_page,
      })
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      return;
    }

    setEditMode(false);
    fetchItem();
  }

  async function remove() {
    if (!id) return;

    const ok = confirm("Delete this wholesale?");
    if (!ok) return;

    const { error } = await supabase
      .from("rpa_wholesale")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      return;
    }

    navigate("/wholesale");
  }

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;
  if (!item || !form) return <p style={{ color: "white" }}>Not found</p>;

  return (
    <div style={{ color: "white", padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ marginTop: 10 }}>{item.companyname}</h1>

      {!editMode ? (
        <>
          <div style={{ marginTop: 20, lineHeight: 1.8 }}>
            <div><b>City:</b> {item.city}</div>
            <div><b>Country:</b> {item.country}</div>
            <div><b>ZIP:</b> {item.zip_code}</div>
            <div><b>Email:</b> {item.email}</div>
            <div><b>Phone:</b> {item.phone1}</div>
            <div><b>Contact:</b> {item.contactperson}</div>
            <div><b>Website:</b> {item.www_page}</div>
            <div><b>Address:</b> {item.streetaddress}</div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => setEditMode(true)}>Edit</button>

            <button
              onClick={remove}
              style={{ marginLeft: 10, color: "red" }}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gap: 8, marginTop: 20 }}>
            <input
              value={form.companyname}
              onChange={(e) =>
                setForm({ ...form, companyname: e.target.value })
              }
              placeholder="Company name"
            />

            <input
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
              placeholder="City"
            />

            <input
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
              placeholder="Country"
            />

            <input
              value={form.zip_code}
              onChange={(e) =>
                setForm({ ...form, zip_code: e.target.value })
              }
              placeholder="ZIP"
            />

            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Email"
            />

            <input
              value={form.phone1}
              onChange={(e) =>
                setForm({ ...form, phone1: e.target.value })
              }
              placeholder="Phone"
            />

            <input
              value={form.contactperson}
              onChange={(e) =>
                setForm({ ...form, contactperson: e.target.value })
              }
              placeholder="Contact person"
            />

            <input
              value={form.www_page}
              onChange={(e) =>
                setForm({ ...form, www_page: e.target.value })
              }
              placeholder="Website"
            />

            <input
              value={form.streetaddress}
              onChange={(e) =>
                setForm({ ...form, streetaddress: e.target.value })
              }
              placeholder="Address"
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={save}>Save</button>
            <button
              onClick={() => {
                setEditMode(false);
                setForm(item);
              }}
              style={{ marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}