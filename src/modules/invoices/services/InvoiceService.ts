import { supabase } from "@services/supabase";
import { recalculateInvoiceTotals } from "../../../core/invoices/recalculateInvoiceTotals";

const TABLE = "rpaheaderofinvoice";
const CUSTOMER_TABLE = "rpa_customer";

// ---------------- SAFE NUMBER ----------------
function safeNumber(v: any, fallback: any = 0) {
  if (v === null || v === undefined || v === "") return fallback;

  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// ---------------- NORMALIZE LINES ----------------
function normalizeLines(lines: any[]) {
  return (lines ?? [])
    .map((l: any) => ({
      price: safeNumber(l.price_snapshot ?? l.price),
      amount: safeNumber(l.amount_snapshot ?? l.amount),
    }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.amount));
}

export const InvoiceService = {

// ---------------- GET ALL ----------------
async getAll() {
  const { data: invoices, error } = await supabase
    .from(TABLE)
    .select(`
      id,
      status,
      date,
      rpa_customer_id,
      subtotal,
      tax,
      total,
      snapshot
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const { data: customers } = await supabase
    .from(CUSTOMER_TABLE)
    .select("id, firstname");

  const customerMap: Record<string, string> = {};

  (customers || []).forEach((c: any) => {
    customerMap[String(c.id)] = c.firstname;
  });

  return (invoices || []).map((inv: any) => {
    const snapshotTotals = inv.snapshot?.totals ?? {};

    return {
      id: inv.id,
      status: inv.status,
      date: inv.date,
      rpa_customer_id: inv.rpa_customer_id,

      customerName:
        customerMap[String(inv.rpa_customer_id)] || "Unknown customer",

      subtotal: safeNumber(inv.subtotal ?? snapshotTotals.subtotal, 0),
      tax: safeNumber(inv.tax ?? snapshotTotals.tax, 0),
      total: safeNumber(inv.total ?? snapshotTotals.total, 0),
    };
  });
},

// ---------------- CREATE ----------------
async create(invoice: any) {
  const safeLines = normalizeLines(invoice?.lines);

  const totals = recalculateInvoiceTotals(safeLines);

  const payload = {
    rpa_customer_id: invoice.rpa_customer_id,
    status: invoice.status ?? "Pending",
    date: invoice.date ?? new Date().toISOString(),

    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,

    snapshot: {
      lines: safeLines,
      totals,
    },
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("CREATE ERROR:", error);
    return null;
  }

  return data;
},

// ---------------- UPDATE ----------------
async update(id: number, invoice: any) {
  try {
    const { data: lines, error: lineError } = await supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", Number(id));

    if (lineError) {
      console.error("LINE FETCH ERROR:", lineError);
      return null;
    }

    const safeLines = normalizeLines(lines ?? []);

    let totals = { subtotal: 0, tax: 0, total: 0 };

    try {
      // 🔥 CRITICAL FIX: ensure pure numbers
      totals = recalculateInvoiceTotals(
        safeLines.map(l => ({
          price: Number(l.price),
          amount: Number(l.amount),
        }))
      );
    } catch (e) {
      console.error("TOTAL CALC ERROR:", e);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({
        status: invoice.status ?? "Pending",

        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,

        snapshot: {
          lines: safeLines,
          totals,
        },
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("UPDATE ERROR:", error);
      return null;
    }

    return data;

  } catch (err) {
    console.error("UPDATE CRASH:", err);
    return null;
  }
},

// ---------------- REMOVE ----------------
async remove(id: number) {
  console.log("🧨 DELETE INVOICE START:", id);

  const { error: lineError } = await supabase
    .from("rpa_invoice_line")
    .delete()
    .eq("rpa_headerofinvoice_id", id);

  if (lineError) {
    console.error("LINE DELETE ERROR:", lineError);
    return false;
  }

  console.log("✅ LINES DELETED");

  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("HEADER DELETE ERROR:", error);
    return false;
  }

  console.log("🟢 HEADER DELETE RESULT:", data);

  return true;
}

};