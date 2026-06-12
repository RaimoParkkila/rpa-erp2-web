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
  const isValidId = !isNaN(invoiceId) && invoiceId > 0;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const safeProducts = Array.isArray(products) ? products : [];

  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState(false);

  const pdfRef = useRef<HTMLDivElement | null>(null);

  // ---------------- LINES ----------------
  const { lines, reload: reloadLines } = useInvoiceLines(invoiceId);

  const safeLines: InvoiceLine[] = Array.isArray(lines) ? lines : [];

  // ---------------- HEADER ----------------
  const reloadHeader = async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError("");

    try {
      const res = await InvoiceDetailService.getById(invoiceId);

      console.log("INVOICE HEADER RAW:", res);

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
    if (!isValidId) return;

    const load = async () => {
      setReady(false);

      await reloadHeader();
      await reloadLines();

      setReady(true);
    };

    load();
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
    console.log("EDIT CLICK:", l);

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

  // ---------------- SAFE CALC ----------------
  const calcTotal = (l: InvoiceLine) => {
    const amount = Number(l.amount_snapshot ?? 0);
    const price = Number(l.price_snapshot ?? 0);
    return amount * price;
  };

  // ---------------- TOTALS (FIXED PIPELINE) ----------------
  const subtotal = safeLines.reduce((sum, l) => {
    const lineTotal = calcTotal(l);

    if (isNaN(lineTotal)) {
      console.warn("BAD LINE:", l);
      return sum;
    }

    return sum + lineTotal;
  }, 0);

  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  console.log("LINES:", safeLines);
  console.log("SUBTOTAL:", subtotal);
  console.log("VAT:", vat);
  console.log("TOTAL:", total);

  const isDraft = isInvoiceEditable(invoice?.status);

  // ---------------- PDF ----------------
  const handleExportPdf = async () => {
    if (!pdfRef.current || !invoice?.id || !ready || exporting) return;

    setExporting(true);
    setError("");

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`invoice-${invoice.id}.pdf`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  // ---------------- UI ----------------
  if (loading) return <div style={{ padding: 20 }}>Loading invoice...</div>;
  if (!invoice) return <div style={{ padding: 20, color: "red" }}>Invoice not found</div>;

  console.log("DEBUG INVOICE:", invoice);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          Invoice #{invoice.id}
          <div style={{ fontSize: 12 }}>Date: {invoice.date}</div>
        </div>

        <div>
          <div>Total: €{total.toFixed(2)}</div>

          <button onClick={handleExportPdf} disabled={!ready || exporting}>
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
          {safeLines.map((l) => (
            <tr key={l.id}>
              <td>{l.productname_snapshot}</td>
              <td>{l.amount_snapshot}</td>
              <td>{Number(l.price_snapshot).toFixed(2)}</td>
              <td>{calcTotal(l).toFixed(2)}</td>
              <td>
                <button onClick={() => openEdit(l)}>Edit</button>
                <button onClick={() => handleDeleteLine(l.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ position: "absolute", left: "-9999px" }}>
        <div ref={pdfRef}>
          <InvoicePdfTemplate data={invoice} lines={safeLines} />
        </div>
      </div>

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
    </>
  );
}