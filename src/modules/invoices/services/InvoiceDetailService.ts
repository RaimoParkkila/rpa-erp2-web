import { supabase } from "@services/supabase";

export const InvoiceDetailService = {
  async getById(id: number) {
    // 1. HEADER
    const { data: invoice, error: invError } = await supabase
      .from("rpaheaderofinvoice")
      .select("*")
      .eq("id", id)
      .single();

    if (invError || !invoice) {
      console.error(invError);
      return null;
    }

    // 2. CUSTOMER
    let customer = null;

    if (invoice.rpa_customer_id) {
      const { data } = await supabase
        .from("rpa_customer")
        .select("id, firstname")
        .eq("id", invoice.rpa_customer_id)
        .single();

      customer = data;
    }

    // 3. LINES
    const { data: lines, error: lineError } = await supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", id);

    if (lineError) {
      console.error(lineError);
    }

    const safeLines = lines || [];

    // 4. TOTAL
    const total = safeLines.reduce(
      (sum, l) => sum + (l.price || 0) * (l.amount || 0),
      0
    );

    // 5. RETURN CLEAN DTO
    return {
      id: invoice.id,
      status: invoice.status,

      rpa_customer_id: invoice.rpa_customer_id,

      // 🔥 FIX: tämä oli puuttuva ja aiheutti undefined bugit
      date: invoice.date,

      customer,
      lines: safeLines,
      total,
    };
  },
};