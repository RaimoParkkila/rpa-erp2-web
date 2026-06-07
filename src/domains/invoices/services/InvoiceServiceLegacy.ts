import { supabase } from "./supabase";

export async function fetchInvoices() {
    return supabase
        .from("rpaheaderofinvoice")
        .select("id, status, rpa_customer_id");
}

export async function updateInvoiceStatus(id: number, status: string) {
    return supabase
        .from("rpaheaderofinvoice")
        .update({ status })
        .eq("id", id);
}