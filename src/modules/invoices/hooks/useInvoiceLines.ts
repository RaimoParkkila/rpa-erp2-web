import { useEffect, useState } from "react";
import { invoiceLineService } from "../services/invoiceLineService";

export const useInvoiceLines = (invoiceId: number) => {
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = async () => {
    if (!invoiceId) return;

    setLoading(true);

    try {
      const res = await invoiceLineService.getByInvoiceId(invoiceId);

      setLines(res.data || res || []);
    } catch (err) {
      console.error("useInvoiceLines reload error:", err);
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