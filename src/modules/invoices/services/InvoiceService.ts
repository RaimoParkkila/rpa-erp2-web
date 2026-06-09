import { supabase } from "@services/supabase";
import { recalculateInvoiceTotals } from "../../../core/invoices/recalculateInvoiceTotals";
import { validateInvoiceSnapshot } from "../utils/validateInvoiceSnapshot";

const TABLE = "rpaheaderofinvoice";
const CUSTOMER_TABLE = "rpa_customer";

export const InvoiceService = {
  async getAll() {
    const { data: invoices, error } = await supabase
      .from(TABLE)
      .select("id, status, date, rpa_customer_id")
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

    return (invoices || []).map((inv: any) => ({
      id: inv.id,
      status: inv.status,
      date: inv.date,

      // 🔥 FIX: always resolved name, not raw id
      customerId: inv.rpa_customer_id,
      customer: customerMap[String(inv.rpa_customer_id)] ?? null,
      customerName: customerMap[String(inv.rpa_customer_id)] ?? null,

      total: inv.total ?? 0,
    }));
  },

  // 🧩 SAFE CREATE (snapshot + validation + totals)
  async create(invoice: any) {
    const isValid = validateInvoiceSnapshot(invoice.lines);

    if (!isValid) {
      throw new Error("Invalid invoice snapshot");
    }

    const totals = recalculateInvoiceTotals(invoice.lines);

    const payload = {
      ...invoice,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      snapshot: {
        lines: invoice.lines,
        totals,
      },
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data;
  },

  // 🧩 SAFE UPDATE
  async update(id: number, invoice: any) {
    const isValid = validateInvoiceSnapshot(invoice.lines);

    if (!isValid) {
      throw new Error("Invalid invoice snapshot");
    }

    const totals = recalculateInvoiceTotals(invoice.lines);

    const payload = {
      ...invoice,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      snapshot: {
        lines: invoice.lines,
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
      console.error(error);
      return null;
    }

    return data;
  },

  async remove(id: number) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) console.error(error);

    return true;
  },
};