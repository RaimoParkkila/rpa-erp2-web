import { supabase } from "../../../services/supabase";

export const invoiceLineService = {
  async getByInvoiceId(invoiceId: number) {
    return supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", invoiceId);
  },

  async addLine(payload: any) {
    return supabase
      .from("rpa_invoice_line")
      .insert(payload);
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