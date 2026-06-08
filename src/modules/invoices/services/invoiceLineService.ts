import { supabase } from "@services/supabase";

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
  async updateLine(id: number, payload: any) {
    console.log("🔵 UPDATE INPUT:", { id, payload });

    const { data, error } = await supabase
      .from("rpa_invoice_line")
      .update({
        productname_snapshot: payload.productname_snapshot,
        amount_snapshot: payload.amount_snapshot,
        price_snapshot: payload.price_snapshot,
      })
      .eq("id", id)
      .select()
      .single();

    console.log("🟢 UPDATE RESPONSE DATA:", data);
    console.log("🔴 UPDATE ERROR:", error);

    return { data, error };
  },
  // ---------------- DELETE LINE ----------------
  async deleteLine(id: number) {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE LINE ERROR:", error);
      throw error;
    }

    return true;
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