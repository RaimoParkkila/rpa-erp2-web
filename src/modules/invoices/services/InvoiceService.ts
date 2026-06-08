import { supabase } from "@services/supabase";

const TABLE = "rpaheaderofinvoice";
const CUSTOMER_TABLE = "rpa_customer";

export const InvoiceService = {
  async getAll() {
    // 1. invoices
    const { data: invoices, error } = await supabase
      .from(TABLE)
      .select("id, status, date, rpa_customer_id")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }

    // 2. customers (separate query)
    const { data: customers } = await supabase
      .from(CUSTOMER_TABLE)
      .select("id, firstname");

    const customerMap: Record<number, string> = {};

    (customers || []).forEach((c: any) => {
      customerMap[c.id] = c.firstname;
    });

    // 3. map ERP DTO
    return (invoices || []).map((inv: any) => ({
      id: inv.id,
      status: inv.status,
      date: inv.date,
      customer: customerMap[inv.rpa_customer_id] ?? null,
      total: 0, // (voit myöhemmin laskea linesistä)
    }));
  },

  async create(payload: any) {
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

  async update(id: number, payload: any) {
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