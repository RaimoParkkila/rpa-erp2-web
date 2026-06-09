import { supabase } from "@services/supabase";
import { recalculateInvoiceTotals } from "../../../core/invoices/recalculateInvoiceTotals";
import { validateInvoiceSnapshot } from "../utils/validateInvoiceSnapshot";

const TABLE = "rpaheaderofinvoice";
const CUSTOMER_TABLE = "rpa_customer";

export const InvoiceService = {
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
      const snapshot = inv.snapshot;
      const snapshotTotals = snapshot?.totals;

      return {
        id: inv.id,
        status: inv.status,
        date: inv.date,

        rpa_customer_id: inv.rpa_customer_id,

        // 🔥 SAFE CUSTOMER RESOLVE
        customerName:
          customerMap[String(inv.rpa_customer_id)] || "Unknown customer",

        // 🔥 FINAL ROBUST FALLBACK CHAIN
        subtotal:
          inv.subtotal ??
          snapshotTotals?.subtotal ??
          0,

        tax:
          inv.tax ??
          snapshotTotals?.tax ??
          0,

        total:
          inv.total ??
          snapshotTotals?.total ??
          0,
      };
    });
  },

  // 🧩 SAFE CREATE
  async create(invoice: any) {
    const safeLines = invoice?.lines ?? [];

    const isValid = validateInvoiceSnapshot(safeLines);

    if (!isValid) {
      throw new Error("Invalid invoice snapshot");
    }

    const totals = recalculateInvoiceTotals(safeLines);

    const payload = {
      ...invoice,
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

  // 🧩 SAFE UPDATE
  async update(id: number, invoice: any) {
    const safeLines = invoice?.lines ?? [];

    const isValid = validateInvoiceSnapshot(safeLines);

    if (!isValid) {
      throw new Error("Invalid invoice snapshot");
    }

    const totals = recalculateInvoiceTotals(safeLines);

    const payload = {
      ...invoice,
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
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("UPDATE ERROR:", error);
      return null;
    }

    return data;
  },

async remove(id: number) {
  console.log("🧨 DELETE INVOICE START:", id);

  // 1. POISTA RIVIT ENSIN (tärkein fix)
  const { error: lineError } = await supabase
    .from("rpa_invoice_line")
    .delete()
    .eq("rpa_headerofinvoice_id", id);

  if (lineError) {
    console.error("❌ LINE DELETE ERROR:", lineError);
    return false;
  }

  console.log("✅ LINES DELETED");

  // 2. POISTA HEADER
  const { data, error } = await supabase
    .from("rpaheaderofinvoice")
    .delete()
    .eq("id", id)
    .select();

  console.log("🟢 HEADER DELETE RESULT:", data);

  if (error) {
    console.error("❌ HEADER DELETE ERROR:", error);
    return false;
  }

  return true;
}
};