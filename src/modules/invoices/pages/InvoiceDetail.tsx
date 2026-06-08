import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import InvoicePdfTemplate from "@domains/invoices/components/InvoicePdfTemplate";
import { isInvoiceEditable } from "@domains/invoices/invoicePolicy";

import { invoiceLineService } from "@modules/invoices/services/invoiceLineService";
import { InvoiceDetailService } from "@modules/invoices/services/InvoiceDetailService";

type InvoiceLine = {
  id: number;
  productname: string;
  amount: number;
  price: number;
};

type Invoice = {
  id: number;
  status: string;
  date: string;
  rpa_customer_id: number;
  lines: InvoiceLine[];
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const [showAddLine, setShowAddLine] = useState(false);
  const [lineAmount, setLineAmount] = useState(1);
  const [linePrice, setLinePrice] = useState(0);
  const [lineProduct, setLineProduct] = useState("");

  const [editingLine, setEditingLine] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const productRef = useRef<HTMLSelectElement | null>(null);

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const calcLineTotal = (l: InvoiceLine) =>
    toNum(l.amount) * toNum(l.price);

  const subtotal = lines.reduce((s, l) => s + calcLineTotal(l), 0);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  const isDraft = isInvoiceEditable(data?.status);

  // ---------------- LOAD (ONLY ON INIT) ----------------
  const reload = async () => {
    try {
      setLoading(true);

      const res = await InvoiceDetailService.getById(invoiceId);

      setData(res);

      const normalized = (res?.lines || []).map((l: any) => ({
        id: l.id,
        productname: l.productname_snapshot ?? l.productname ?? "",
        amount: Number(l.amount_snapshot ?? l.amount ?? 1),
        price: Number(l.price_snapshot ?? l.price ?? 0),
      }));

      setLines(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [invoiceId]);

  // ---------------- PRODUCTS ----------------
  useEffect(() => {
    (async () => {
      const { data } = await fetch("/api/products").then(r => r.json());
      setProducts(data || []);
    })();
  }, []);

  // ---------------- ADD (OPTIMISTIC) ----------------
  const handleAddLine = async () => {
    if (!invoiceId || !lineProduct) return;

    const selected = products.find(
      (p) => Number(p.id) === Number(lineProduct)
    );

    if (!selected) return;

    const tempId = Date.now();

    const optimisticLine: InvoiceLine = {
      id: tempId,
      productname: selected.productname,
      amount: toNum(lineAmount),
      price: toNum(linePrice || selected.price),
    };

    setLines((prev) => [...prev, optimisticLine]);

    setShowAddLine(false);
    setLineProduct("");
    setLineAmount(1);
    setLinePrice(0);

    try {
      const res = await invoiceLineService.addLine(
        invoiceId,
        selected,
        optimisticLine.amount,
        optimisticLine.price
      );

      setLines((prev) =>
        prev.map((l) =>
          l.id === tempId ? { ...l, id: res.data.id } : l
        )
      );
    } catch (err) {
      console.error(err);
      setLines((prev) => prev.filter((l) => l.id !== tempId));
    }
  };

  // ---------------- UPDATE (OPTIMISTIC) ----------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const backup = lines;

    setLines((prev) =>
      prev.map((l) =>
        l.id === editingLine.id
          ? {
              ...l,
              productname: editingLine.productname,
              amount: editingLine.amount,
              price: editingLine.price,
            }
          : l
      )
    );

    setEditingLine(null);

    try {
      await invoiceLineService.updateLine(editingLine.id, {
        productname_snapshot: editingLine.productname,
        amount_snapshot: toNum(editingLine.amount),
        price_snapshot: toNum(editingLine.price),
      });
    } catch (err) {
      console.error(err);
      setLines(backup);
    }
  };

  // ---------------- DELETE (OPTIMISTIC) ----------------
  const handleDeleteLine = async (id: number) => {
    const backup = lines;

    setLines((prev) => prev.filter((l) => l.id !== id));

    try {
      await invoiceLineService.deleteLine(id);
    } catch (err) {
      console.error(err);
      setLines(backup);
    }
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
      <h2>Invoice #{data.id}</h2>

      <div>Total: €{total.toFixed(2)}</div>

      <button disabled={!isDraft} onClick={() => setShowAddLine(true)}>
        + Add Line
      </button>

      <button onClick={reload}>Refresh</button>
      <button onClick={exportPdf}>Export PDF</button>

      {/* LINES */}
      <table>
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
          {lines.map((l) => (
            <tr key={l.id}>
              <td>{l.productname}</td>
              <td>{l.amount}</td>
              <td>{l.price.toFixed(2)}</td>
              <td>{(l.amount * l.price).toFixed(2)}</td>
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
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productname}
              </option>
            ))}
          </select>

          <input
            type="number"
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
        <div>
          <input
            value={editingLine.productname}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                productname: e.target.value,
              })
            }
          />

          <input
            type="number"
            value={editingLine.amount}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                amount: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            value={editingLine.price}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                price: Number(e.target.value),
              })
            }
          />

          <button onClick={handleUpdateLine}>Save</button>
          <button onClick={() => setEditingLine(null)}>
            Cancel
          </button>
        </div>
      )}

      <div style={{ display: "none" }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}