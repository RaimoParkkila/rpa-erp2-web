import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase";

export type InvoiceLineModel = {
  id: number;
  productname: string;
  amount: number;
  price: number;
  total: number;
};

const normalize = (l: any): InvoiceLineModel => {
  const amount = Number(l.amount_snapshot ?? l.amount ?? 1);
  const price = Number(l.price_snapshot ?? l.price ?? 0);

  return {
    id: l.id,
    productname: l.productname_snapshot ?? l.productname ?? "",
    amount,
    price,
    total: amount * price,
  };
};

export const useInvoiceLines = (invoiceId: number) => {
  const [lines, setLines] = useState<InvoiceLineModel[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!invoiceId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_invoice_line")
      .select("*")
      .eq("rpa_headerofinvoice_id", invoiceId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setLines((data || []).map(normalize));
    setLoading(false);
  };

  const addLine = async (payload: any) => {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .insert(payload);

    if (!error) await reload();
  };

  const updateLine = async (id: number, payload: any) => {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .update(payload)
      .eq("id", id);

    if (!error) await reload();
  };

  const deleteLine = async (id: number) => {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .delete()
      .eq("id", id);

    if (!error) await reload();
  };

  useEffect(() => {
    reload();
  }, [invoiceId]);

  return {
    lines,
    loading,
    reload,
    addLine,
    updateLine,
    deleteLine,
  };
};