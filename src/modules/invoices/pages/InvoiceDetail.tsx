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
};

type Invoice = {
  id: number;
  status: InvoiceStatus;
  date: string;
  rpa_customer_id: number;
  lines: InvoiceLine[];
};

type EditingLine = {
  id: number;
  productname: string;
  amount: number;
  price: number;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [linesCache, setLinesCache] = useState<any[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  const [lineAmount, setLineAmount] = useState(1);
  const [linePrice, setLinePrice] = useState(0);
  const [lineProduct, setLineProduct] = useState("");

  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const productRef = useRef<HTMLSelectElement | null>(null);

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const calcLineTotal = (l: any) =>
    toNum(l.price_snapshot) * toNum(l.amount_snapshot);

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

      const normalizedLines = (res?.lines || []).map((l: any) => ({
        id: l.id,
        productname_snapshot:
          l.productname_snapshot ?? l.productname ?? "—",
        amount_snapshot: Number(l.amount_snapshot ?? l.amount ?? 1),
        price_snapshot: Number(l.price_snapshot ?? l.price ?? 0),
      }));

      setLinesCache(normalizedLines);
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
      productname_snapshot: selected.productname,
      price: toNum(linePrice || selected.price),
      price_snapshot: toNum(linePrice || selected.price),
      amount: toNum(lineAmount),
      amount_snapshot: toNum(lineAmount),
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

  // ---------------- EDIT OPEN ----------------
  const openEdit = (l: any) => {
    setEditingLine({
      id: l.id,
      productname: l.productname_snapshot ?? "",
      amount: l.amount_snapshot ?? 1,
      price: l.price_snapshot ?? 0,
    });
  };

  // ---------------- UPDATE ----------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const payload = {
      productname_snapshot: editingLine.productname ?? "",
      amount_snapshot: Number(editingLine.amount ?? 1),
      price_snapshot: Number(editingLine.price ?? 0),
    };

    const { error } = await supabase
      .from("rpa_invoice_line")
      .update(payload)
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
      Invoice #{data.id}
      <h3>Total: €{total.toFixed(2)}</h3>

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
              <td>{l.productname_snapshot}</td>
              <td>{l.amount_snapshot}</td>
              <td>{Number(l.price_snapshot).toFixed(2)}</td>
              <td>
                {(Number(l.amount_snapshot) * Number(l.price_snapshot)).toFixed(2)}
              </td>
              <td>
                <button onClick={() => openEdit(l)}>Edit</button>
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
            onChange={(e) =>
              setLineAmount(Number(e.target.value) || 1)
            }
          />

          <input
            type="number"
            value={linePrice}
            onChange={(e) =>
              setLinePrice(Number(e.target.value))
            }
          />

          <button onClick={handleAddLine}>Save</button>
          <button onClick={() => setShowAddLine(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* EDIT */}
      {editingLine && (
        <div style={{ border: "1px solid #ccc", padding: 10 }}>
          <div>
            <label>Product</label>
            <input
              value={editingLine.productname}
              onChange={(e) =>
                setEditingLine({
                  ...editingLine,
                  productname: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Amount</label>
            <input
              type="number"
              min={1}
              value={editingLine.amount}
              onChange={(e) =>
                setEditingLine({
                  ...editingLine,
                  amount: Number(e.target.value) || 1,
                })
              }
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              value={editingLine.price}
              onChange={(e) =>
                setEditingLine({
                  ...editingLine,
                  price: Number(e.target.value) || 0,
                })
              }
            />
          </div>

          <button onClick={handleUpdateLine}>Save</button>
          <button onClick={() => setEditingLine(null)}>
            Cancel
          </button>
        </div>
      )}

      <div style={{ position: "absolute", left: "-9999px" }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}