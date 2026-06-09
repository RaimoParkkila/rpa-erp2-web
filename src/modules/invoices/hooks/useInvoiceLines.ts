import { useEffect, useState } from "react";
import { invoiceLineService } from "../services/invoiceLineService";
import type { InvoiceLine } from "../types/InvoiceLine";

export const useInvoiceLines = (invoiceId: number) => {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!invoiceId) return;

    setLoading(true);

    try {
      const res = await invoiceLineService.getByInvoiceId(invoiceId);

      const data: any[] = res?.data || res || [];

      const normalized: InvoiceLine[] = data.map((l) => ({
        id: l.id,

        productname_snapshot: l.productname_snapshot ?? "",
        amount_snapshot: Number(l.amount_snapshot ?? 0),
        price_snapshot: Number(l.price_snapshot ?? 0),
      }));

      setLines(normalized);
    } catch (err) {
      console.error("useInvoiceLines reload error:", err);
      setLines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [invoiceId]);

  return {
    lines,
    reload,
    loading,
  };
};