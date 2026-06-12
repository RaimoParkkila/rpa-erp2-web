import { supabase } from "@services/supabase";

export type InvoiceDetailDTO = {
  id: number;
  status: string;
  date: string;
  rpa_customer_id: number;

  customerName: string | null;

  lines: any[];

  subtotal: number;
  tax: number;
  total: number;
};

export const InvoiceDetailService = {
  async getById(id: number): Promise<InvoiceDetailDTO | null> {
    // 1. HEADER
    const { data: invoice, error: invError } = await supabase
      .from("rpaheaderofinvoice")
      .select("*")
      .eq("id", id)
      .single();

    if (invError || !invoice) {
      console.error("INVOICE HEADER ERROR:", invError);
      return null;
    }

    // 2. CUSTOMER
    let customerName: string | null = null;

    if (invoice.rpa_customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from("rpa_customer")
        .select("firstname")
        .eq("id", invoice.rpa_customer_id)
        .single();

      if (!customerError && customer) {
        customerName = customer.firstname ?? null;
      }
    }

    // 3. LINES (🔥 SNAPSHOT ONLY - SOURCE OF TRUTH)
    const { data: lines, error: lineError } = await supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", id);

    if (lineError) {
      console.error("LINE ERROR:", lineError);
    }

    const safeLines = (lines ?? []).map((l: any) => {
      const price = Number(l.price_snapshot ?? 0);
      const amount = Number(l.amount_snapshot ?? 0);

      console.log("🔥 RAW LINES FROM DB:", lines);
      console.log("🔥 INVOICE ID USED:", id);

      return {
        ...l,
        productname: l.productname_snapshot ?? l.productname,
        price,
        amount,
      };
    });

    // 4. TOTAL CALCULATION (ONLY SNAPSHOT FIELDS)
    const subtotal = safeLines.reduce(
      (sum, l) => sum + l.price * l.amount,
      0
    );

    const tax = subtotal * 0.24;
    const total = subtotal + tax;

    // 5. DTO RETURN
    return {
      id: invoice.id,
      status: invoice.status,
      date: invoice.date,

      rpa_customer_id: invoice.rpa_customer_id,
      customerName,

      lines: safeLines,

      subtotal,
      tax,
      total,
    };
  },
};