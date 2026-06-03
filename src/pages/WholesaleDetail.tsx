import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

type Wholesale = {
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

export default function WholesaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Wholesale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    setLoading(true);

    const { data } = await supabase
      .from("rpa_wholesale")
      .select("*")
      .eq("id", id)
      .single();

    setItem(data);
    setLoading(false);
  }

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;
  if (!item) return <p style={{ color: "white" }}>Not found</p>;

  return (
    <div style={{ color: "white" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 20,
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1 style={{ margin: 0 }}>{item.branchofficename}</h1>

      <div style={{ marginTop: 10, opacity: 0.6 }}>
        Wholesale branch detail view
      </div>

      <div style={{ marginTop: 20, lineHeight: 1.8 }}>
        <div><b>City:</b> {item.city}</div>
        <div><b>Country:</b> {item.country}</div>
        <div><b>ZIP:</b> {item.zipcode}</div>
        <div><b>Email:</b> {item.email}</div>
        <div><b>Phone:</b> {item.phone1}</div>
        <div><b>Activated:</b> {item.activated_date}</div>
        <div><b>Address:</b> {item.streetaddress}</div>
      </div>
    </div>
  );
}