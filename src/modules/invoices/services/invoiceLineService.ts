import { supabase } from "@services/supabase";
import { recalculateInvoiceTotals } from "../../../core/invoices/recalculateInvoiceTotals";

export const invoiceLineService = {
  // ---------------- ADD LINE ----------------
  async addLine(
    invoiceId: number,
    product: any,
    amount: number,
    price: number
  ) {
    const payload = {
      rpa_headerofinvoice_id: invoiceId,
      rpa_shop_product_id: product.id,

      productname: product.productname,
      productname_snapshot: product.productname,

      amount,
      amount_snapshot: amount,

      price,
      price_snapshot: price,
    };

    const { data, error } = await supabase
      .from("rpa_invoice_line")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("ADD LINE ERROR:", error);
      throw error;
    }

    return { data };
  },

  // ---------------- UPDATE LINE ----------------
  async update(id: number, invoice: any) {
    console.log("🧾 UPDATE INPUT:", invoice);

    const { data: existing, error: fetchError } = await supabase
      .from("rpaheaderofinvoice")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("FETCH ERROR:", fetchError);
      return null;
    }

    // 🔥 ALWAYS TRUST DB FIRST
    const safeSnapshot = existing?.snapshot ?? {
      lines: [],
      totals: {
        subtotal: existing?.subtotal ?? 0,
        tax: existing?.tax ?? 0,
        total: existing?.total ?? 0,
      },
    };

    const safeLines = safeSnapshot.lines ?? [];

    console.log("📦 SAFE LINES:", safeLines);

    const totals =
      safeLines.length > 0
        ? recalculateInvoiceTotals(safeLines)
        : safeSnapshot.totals;

    const payload = {
      status: invoice.status ?? existing.status,
      rpa_customer_id:
        invoice.rpa_customer_id ?? existing.rpa_customer_id,

      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,

      snapshot: {
        lines: safeLines,
        totals,
      },
    };

    console.log("📤 FINAL UPDATE PAYLOAD:", payload);

    const { data, error } = await supabase
      .from("rpaheaderofinvoice")
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
  // ---------------- GET BY INVOICE ----------------
  async getByInvoiceId(invoiceId: number) {
    const { data, error } = await supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", invoiceId);

    if (error) {
      console.error("GET LINES ERROR:", error);
      return { data: [], error };
    }

    return { data, error: null };
  },
};