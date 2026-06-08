import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import InvoicePdfTemplate from "@domains/invoices/components/InvoicePdfTemplate";
import { isInvoiceEditable } from "@domains/invoices/invoicePolicy";

import { invoiceLineService } from "@modules/invoices/services/invoiceLineService";
import { InvoiceDetailService } from "@modules/invoices/services/InvoiceDetailService";
import { supabase } from "@services/supabase";
import AddInvoiceLine from "@components/AddInvoiceLine";


// ---------------- DOMAIN MODEL ----------------
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

// ---------------- UI EDIT MODEL ----------------
type EditingLine = {
  id: number;
  productname: string;
  amount: string;
  price: string;
};

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const safeProducts = Array.isArray(products) ? products : [];

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const calcTotal = (l: InvoiceLine) => toNum(l.amount) * toNum(l.price);

  const subtotal = lines.reduce((s, l) => s + calcTotal(l), 0);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  const isDraft = isInvoiceEditable(data?.status);

  // ---------------- LOAD ----------------
  const reload = async () => {
    setLoading(true);

    const res = await InvoiceDetailService.getById(invoiceId);
    setData(res);

    const normalized: InvoiceLine[] = (res?.lines || []).map((l: any) => ({
      id: l.id,
      productname: l.productname_snapshot ?? l.productname ?? "",
      amount: Number(l.amount_snapshot ?? l.amount ?? 1),
      price: Number(l.price_snapshot ?? l.price ?? 0),
    }));

    setLines(normalized);
    setLoading(false);
  };

  useEffect(() => {
    if (!invoiceId) return;
    reload();
  }, [invoiceId]);

  // ---------------- PRODUCTS ----------------
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("rpa_shop_product")
        .select("id, productname, price");

      if (!error) setProducts(data || []);
    };

    load();
  }, []);

  // ---------------- EDIT OPEN (CRITICAL FIX) ----------------
  const openEdit = (l: InvoiceLine) => {
    setEditingLine({
      id: l.id,
      productname: l.productname,
      amount: String(l.amount),
      price: String(l.price),
    });
  };

  // ---------------- UPDATE ----------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const updated: InvoiceLine = {
      id: editingLine.id,
      productname: editingLine.productname,
      amount: toNum(editingLine.amount),
      price: toNum(editingLine.price),
    };

    const backup = lines;

    setLines((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );

    setEditingLine(null);

    try {
      await invoiceLineService.updateLine(updated.id, {
        productname_snapshot: updated.productname,
        amount_snapshot: updated.amount,
        price_snapshot: updated.price,
      });
    } catch (err) {
      console.error(err);
      setLines(backup);
    }
  };

  // ---------------- DELETE ----------------
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

  // ---------------- UI ----------------
  if (loading) return <>Loading...</>;
  if (!data) return <>No invoice found</>;

  return (
    <>
      <div>
        Invoice #{data.id} | Total: €{total.toFixed(2)}
      </div>

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
              <td>{calcTotal(l).toFixed(2)}</td>
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
      {isDraft && (
        <div style={{ marginTop: 16, padding: 12, border: "1px dashed #ccc" }}>
          <h4>Add Line</h4>

          <AddInvoiceLine
            products={safeProducts}
            invoiceId={invoiceId}
            invoiceLineService={invoiceLineService}
            onAdded={reload}
          />
        </div>
      )}
      {/* EDIT MODAL */}
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
                amount: e.target.value, // IMPORTANT: string stays string
              })
            }
          />

          <input
            type="number"
            value={editingLine.price}
            onChange={(e) =>
              setEditingLine({
                ...editingLine,
                price: e.target.value,
              })
            }
          />

          <button onClick={handleUpdateLine}>Save</button>
          <button onClick={() => setEditingLine(null)}>Cancel</button>
        </div>
      )}

      <div style={{ display: "none" }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}