import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import InvoicePdfTemplate from "@domains/invoices/components/InvoicePdfTemplate";
import { isInvoiceEditable } from "@domains/invoices/invoicePolicy";

import { invoiceLineService } from "@modules/invoices/services/invoiceLineService";
import { InvoiceDetailService } from "@modules/invoices/services/InvoiceDetailService";
import { supabase } from "@services/supabase";

import AddInvoiceLine from "@components/AddInvoiceLine";
import { useInvoiceLines } from "../hooks/useInvoiceLines";
import InvoiceLineEditor from "../components/InvoiceLineEditor";
import type { InvoiceLine } from "../types/InvoiceLine";

// ---------------- TYPES ----------------
type Invoice = {
  id: number;
  status: string;
  date: string;
  rpa_customer_id: number;
};

type EditingLine = {
  id: number;
  productname: string;
  amount: string;
  price: string;
};



// ---------------- COMPONENT ----------------
export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);


  const [products, setProducts] = useState<any[]>([]);
  const safeProducts = Array.isArray(products) ? products : [];

  // ---------------- LINES ----------------
  const { lines, reload: reloadLines } = useInvoiceLines(invoiceId);
  const [error, setError] = useState("");

  // ---------------- HEADER ----------------
  const reloadHeader = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");

    try {
      const res = await InvoiceDetailService.getById(invoiceId);

      if (!res) {
        throw new Error("Invoice not found");
      }

      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invoiceId) return;

    reloadHeader();
    reloadLines();
  }, [invoiceId]);

  // ---------------- PRODUCTS ----------------
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rpa_shop_product")
        .select("id, productname, price");

      setProducts(data || []);
    };

    load();
  }, []);

  // ---------------- EDIT ----------------
  const openEdit = (l: InvoiceLine) => {
    console.log("OPEN EDIT RAW LINE:", l);

    setEditingLine({
      id: l.id,
      productname: l.productname_snapshot,
      amount: String(l.amount_snapshot),
      price: String(l.price_snapshot),
    });
  };
  const toNum = (v: any) => Number(v) || 0;

  // ---------------- UPDATE ----------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    setError("");

    const updated = {
      id: editingLine.id,
      productname: editingLine.productname,
      amount: toNum(editingLine.amount),
      price: toNum(editingLine.price),
    };

    try {
      await invoiceLineService.updateLine(updated.id, {
        productname_snapshot: updated.productname,
        amount_snapshot: updated.amount,
        price_snapshot: updated.price,
      });

      setEditingLine(null);
      reloadLines();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update line");
    }
  };

  // ---------------- DELETE ----------------
  const handleDeleteLine = async (id: number) => {
    setError("");

    try {
      await invoiceLineService.deleteLine(id);
      reloadLines();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete line");
    }
  };
  // ---------------- CALC ----------------
  const calcTotal = (l: InvoiceLine) =>
    Number(l.amount_snapshot) * Number(l.price_snapshot);

  const subtotal = lines.reduce((s, l) => s + calcTotal(l), 0);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  const isDraft = isInvoiceEditable(data?.status);

  // ---------------- UI ----------------
  if (loading) return <>Loading...</>;
  if (!data) return <>No invoice found</>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        Invoice #{data.id}
        Total: €{total.toFixed(2)}
      </div>
      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>
          ⚠ {error}
        </div>
      )}
      {/* TABLE */}
      <table style={{ width: "100%" }}>
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
              <td>{l.productname_snapshot}</td>

              <td>{l.amount_snapshot}</td>

              <td>{Number(l.price_snapshot).toFixed(2)}</td>

              <td>
                {(l.amount_snapshot * l.price_snapshot).toFixed(2)}
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
      {isDraft && (
        <AddInvoiceLine
          products={safeProducts}
          invoiceId={invoiceId}
          invoiceLineService={invoiceLineService}
          onAdded={reloadLines}
        />
      )}

      {/* EDIT */}
      {editingLine && (
        <InvoiceLineEditor
          value={editingLine}
          onChange={setEditingLine}
          onSave={handleUpdateLine}
          onCancel={() => setEditingLine(null)}
        />
      )}

      {/* PDF */}
      <div style={{ display: "none" }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}