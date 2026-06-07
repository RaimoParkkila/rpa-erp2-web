import { supabase } from "../services/supabase";

export async function getCustomerById(id: number) {
  return supabase
    .from("rpa_customer")
    .select("*")
    .eq("id", id)
    .single();
}

export async function updateCustomer(id: number, payload: any) {
  return supabase
    .from("rpa_customer")
    .update(payload)
    .eq("id", id);
}

export async function getCustomerInvoices(id: number) {
  return supabase
    .from("rpa_customer_rpaheaderofinvoice")
    .select("id, status, date")
    .eq("rpa_customer_id", id)
    .order("date", { ascending: false });
}

export async function createInvoice(customerId: number) {
  return supabase
    .from("rpaheaderofinvoice")
    .insert({
      rpa_customer_id: customerId,
      status: "Draft",
      date: new Date().toISOString(),
    })
    .select()
    .single();
}

export async function getDefaultProduct() {
  return supabase
    .from("rpa_shop_product")
    .select("id, productname, price")
    .limit(1)
    .single();
}

export async function createInvoiceLine(payload: any) {
  return supabase
    .from("rpa_invoice_line")
    .insert(payload);
}