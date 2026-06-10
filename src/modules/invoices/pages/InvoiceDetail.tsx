import { useEffect, useState, useRef } from "react";
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ---------------- TYPES ----------------
type Invoice = {
  id: number;
  status: string;
  date: string;
  rpa_customer_id: number;
  customerName?: string;
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

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const safeProducts = Array.isArray(products) ? products : [];

  const [error, setError] = useState("");

  const pdfRef = useRef<HTMLDivElement | null>(null);

  // ---------------- LINES ----------------
  const { lines, reload: reloadLines } = useInvoiceLines(invoiceId);

  // ---------------- HEADER ----------------
  const reloadHeader = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");

    try {
      const res = await InvoiceDetailService.getById(invoiceId);
      if (!res) throw new Error("Invoice not found");

      setInvoice(res);
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

    try {
      await invoiceLineService.updateLine(editingLine.id, {
        productname_snapshot: editingLine.productname,
        amount_snapshot: toNum(editingLine.amount),
        price_snapshot: toNum(editingLine.price),
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

  const isDraft = isInvoiceEditable(invoice?.status);

  // ---------------- PDF ----------------
  const handleExportPdf = async () => {
    if (!pdfRef.current || !invoice) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const width = 210;
    const height = 297;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`invoice-${invoice.id}.pdf`);
  };

  // ---------------- UI ----------------
  if (loading) return <>Loading...</>;
  if (!invoice) return <>No invoice found</>;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "16px",
          background: "#fafafa",
        }}
      >
        {/* LEFT SIDE */}
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            Invoice #{invoice.id}
          </div>

          <div style={{ fontSize: "12px", color: "#666" }}>
            Date: {invoice.date}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            Total: €{total.toFixed(2)}
          </div>

          <button
            onClick={handleExportPdf}
            style={{
              marginTop: "6px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

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
        <AddInvoiceLine
          products={safeProducts}
          invoiceId={invoiceId}
          invoiceLineService={invoiceLineService}
          onAdded={reloadLines}
        />
      )}

      {editingLine && (
        <InvoiceLineEditor
          value={editingLine}
          onChange={setEditingLine}
          onSave={handleUpdateLine}
          onCancel={() => setEditingLine(null)}
        />
      )}

      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={pdfRef}>
          <InvoicePdfTemplate data={invoice} lines={lines} />
        </div>
      </div>
    </>
  );
}