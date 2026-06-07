import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { InvoiceDetailService } from "../services/InvoiceDetailService";
import { supabase } from "../../../services/supabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoicePdfTemplate from "../../../domains/invoices/components/InvoicePdfTemplate";

type InvoiceStatus = "Draft" | "Sent" | "Paid";

type InvoiceLine = {
  id: number;
  productname_snapshot: string;
  price_snapshot: number;
  amount_snapshot: number;
  price?: number;
  amount?: number;
};

type Invoice = {
  id: number;
  status: InvoiceStatus;
  date: string;
  rpa_customer_id: number;
  customer?: { id: number; firstname: string } | null;
  lines: InvoiceLine[];
  total?: number;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [linesCache, setLinesCache] = useState<any[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  //const [lineAmount, setLineAmount] = useState("1");
  const [lineAmount, setLineAmount] = useState<string>("1");
  
  const [linePrice, setLinePrice] = useState<number>(0);
  const [lineProduct, setLineProduct] = useState<string>("");

  const [editingLine, setEditingLine] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const productRef = useRef<HTMLSelectElement | null>(null);


  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const calcLineTotal = (l: any) =>
    toNum(l.price_snapshot ?? l.price) * toNum(l.amount_snapshot ?? l.amount);

  const subtotal = linesCache.reduce(
    (s, l) => s + calcLineTotal(l),
    0
  );

  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  const status = (data?.status ?? "").toUpperCase();
  const isDraft = status === "DRAFT" || status === "PENDING";

  // ---------------- LOAD ----------------
  const reload = () => {
    if (!invoiceId) return;

    setLoading(true);
    InvoiceDetailService.getById(invoiceId).then((res) => {
      setData(res);
      setLinesCache(res?.lines || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, [invoiceId]);

  // ---------------- PRODUCTS ----------------
  useEffect(() => {
    supabase
      .from("rpa_shop_product")
      .select("id, productname, price")
      .then(({ data }) => setProducts(data || []));
  }, []);

  // ---------------- ADD LINE ----------------
  const handleAddLine = async () => {
    if (!invoiceId || !lineProduct) return;

    const selected = products.find(
      (p) => Number(p.id) === Number(lineProduct)
    );

    if (!selected) return;

    const payload = {
      rpa_headerofinvoice_id: invoiceId,
      rpa_shop_product_id: selected.id,

      productname: selected.productname,
      price: toNum(linePrice || selected.price),
      amount: toNum(lineAmount),
    };

    const { error } = await supabase
      .from("rpa_invoice_line")
      .insert(payload);

    if (error) {
      console.error("ADD LINE ERROR:", error);
      return;
    }

    setShowAddLine(false);
    setLineProduct("");
    setLineAmount(1);
    setLinePrice(0);

    reload();
  };

  // ---------------- UPDATE ----------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const { error } = await supabase
      .from("rpa_invoice_line")
      .update({
        rpa_shop_product_id: editingLine.rpa_shop_product_id,

        productname_snapshot: editingLine.productname_snapshot,
        price_snapshot: toNum(editingLine.price_snapshot),
        amount_snapshot: toNum(editingLine.amount_snapshot),
      })
      .eq("id", editingLine.id);

    if (error) {
      console.error("UPDATE ERROR:", error);
      return;
    }

    setEditingLine(null);
    reload();
  };

  // ---------------- DELETE ----------------
  const handleDeleteLine = async (id: number) => {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      return;
    }

    reload();
  };

  // ---------------- PDF ----------------
  const exportPdf = async () => {
    const input = document.getElementById("invoice-pdf");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice-${data?.id}.pdf`);
  };

  // ---------------- UI ----------------
  if (loading) return <>Loading...</>;
  if (!data) return <>No invoice found</>;

  return (
    <>
      <h1>Invoice #{data.id}</h1>

      <h2>Total: €{total.toFixed(2)}</h2>

      <button disabled={!isDraft} onClick={() => setShowAddLine(true)}>
        + Add Line
      </button>

      <button onClick={reload}>Refresh</button>
      <button onClick={exportPdf}>Export PDF</button>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {linesCache.map((l) => (
            <tr key={l.id}>
              <td>{l.productname ?? l.productname_snapshot}</td>
              <td>{l.amount ?? l.amount_snapshot}</td>
              <td>{toNum(l.price_snapshot).toFixed(2)}</td>
              <td>{calcLineTotal(l).toFixed(2)}</td>

              <td>
                <button onClick={() => setEditingLine(l)}>Edit</button>
                <button onClick={() => handleDeleteLine(l.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD */}
      {showAddLine && (
        <div>
          <select
            ref={productRef}
            value={lineProduct}
            onChange={(e) => {
              const p = products.find(
                (x) => x.id === Number(e.target.value)
              );

              setLineProduct(e.target.value);
              setLinePrice(p?.price ?? 0);
            }}
          >
            <option value="">Select</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productname}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={lineAmount}
            onChange={(e) => {
              const v = e.target.value;

              // estä negatiiviset
              if (Number(v) < 0) return;

              setLineAmount(v);
            }}
          />
          <input
            type="number"
            value={linePrice}
            onChange={(e) => setLinePrice(Number(e.target.value))}
          />

          <button onClick={handleAddLine}>Save</button>
          <button onClick={() => setShowAddLine(false)}>Cancel</button>
        </div>
      )}

      {/* EDIT */}
      {editingLine && (
        <div>
          <input
            value={editingLine.amount_snapshot}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                amount_snapshot: Number(e.target.value),
              })
            }
          />

          <input
            value={editingLine.price_snapshot}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                price_snapshot: Number(e.target.value),
              })
            }
          />

          <button onClick={handleUpdateLine}>Save</button>
          <button onClick={() => setEditingLine(null)}>Cancel</button>
        </div>
      )}

      <div style={{ position: "absolute", left: "-9999px" }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}