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
  customerName?: string; // 🔥 FIX: tärkeä PDF:lle
};

// ---------------- COMPONENT ----------------
export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [invoice, setInvoice] = useState<Invoice | null>(null); // 🔥 FIX
  const [loading, setLoading] = useState(true);

  const [editingLine, setEditingLine] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const safeProducts = Array.isArray(products) ? products : [];

  const [error, setError] = useState("");

  const pdfRef = useRef(null);

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

      setInvoice(res); // 🔥 FIX
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PDF EXPORT ----------------
  const handleExportPdf = async () => {
    if (!pdfRef.current || !invoice) return;

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoice.id}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
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

  // ---------------- UI ----------------
  if (loading) return <>Loading...</>;
  if (!invoice) return <>No invoice found</>;

  return (
    <>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          Invoice #{invoice.id}
          <br />
          Date: {invoice.date}
          <br />
          {/* 🔥 FIX: customerName */}
          Customer: {invoice.customerName ?? "Unknown"}
        </div>

        <div>
          Total: €{total.toFixed(2)}
          <br />
          <button onClick={handleExportPdf}>Export PDF</button>
        </div>
      </div>

      {error && <div style={{ color: "red" }}>⚠ {error}</div>}

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

      {/* PDF TARGET */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            minHeight: "297mm",
            background: "white",
          }}
        >
          <InvoicePdfTemplate data={invoice} lines={lines} />
        </div>
      </div>
    </>
  );
}