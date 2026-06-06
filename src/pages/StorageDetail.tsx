import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

type StorageBranch = {
  id: number;
  zipcode: string;
  activated_date: string;
  branchofficename: string;
  city: string;
  country: string;
  email: string;
  phone1: string;
  streetaddress: string;
};

export default function StorageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<StorageBranch | null>(null);
  const [form, setForm] = useState<StorageBranch | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_storagebranchoffice")
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
      .from("rpa_storagebranchoffice")
      .update({
        branchofficename: form.branchofficename,
        city: form.city,
        country: form.country,
        zipcode: form.zipcode,
        email: form.email,
        phone1: form.phone1,
        streetaddress: form.streetaddress,
        activated_date: form.activated_date,
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

    const ok = confirm("Delete this storage branch?");
    if (!ok) return;

    const { error } = await supabase
      .from("rpa_storagebranchoffice")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      return;
    }

    navigate("/storage");
  }

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;
  if (!item || !form) return <p style={{ color: "white" }}>Not found</p>;

  return (
    <div style={{ color: "white", padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1 style={{ marginTop: 10 }}>{item.branchofficename}</h1>

      {!editMode ? (
        <>
          <div style={{ marginTop: 20, lineHeight: 1.8 }}>
            <div><b>City:</b> {item.city}</div>
            <div><b>Country:</b> {item.country}</div>
            <div><b>ZIP:</b> {item.zipcode}</div>
            <div><b>Email:</b> {item.email}</div>
            <div><b>Phone:</b> {item.phone1}</div>
            <div><b>Address:</b> {item.streetaddress}</div>
            <div><b>Activated:</b> {item.activated_date}</div>
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
              value={form.branchofficename}
              onChange={(e) =>
                setForm({ ...form, branchofficename: e.target.value })
              }
              placeholder="Branch name"
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
              value={form.zipcode}
              onChange={(e) =>
                setForm({ ...form, zipcode: e.target.value })
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