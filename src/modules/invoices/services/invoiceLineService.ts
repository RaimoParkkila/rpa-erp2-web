import { supabase } from "@services/supabase";

export const invoiceLineService = {
  async addLine(invoiceId: number, product: any, amount: number, price: number) {
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

    return supabase
      .from("rpa_invoice_line")
      .insert(payload)
      .select()
      .single();
  },

  async updateLine(id: number, payload: any) {
    return supabase
      .from("rpa_invoice_line")
      .update(payload)
      .eq("id", id);
  },

  async deleteLine(id: number) {
    return supabase
      .from("rpa_invoice_line")
      .delete()
      .eq("id", id);
  },
};