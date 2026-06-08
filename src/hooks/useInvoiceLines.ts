import { useState } from "react";
import { invoiceLineService } from "../../src/modules/invoices/services/invoiceLineService";

type InvoiceLine = {
  id: number;
  productname: string;
  amount: number;
  price: number;
};

export function useInvoiceLines(invoiceId: number, products: any[]) {
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // ---------------- ADD ----------------
  const addLine = async (productId: number, amount: number, price: number) => {
    const selected = products.find((p) => Number(p.id) === Number(productId));
    if (!selected) return;

    const tempId = Date.now();

    const optimistic = {
      id: tempId,
      productname: selected.productname,
      productname_snapshot: selected.productname,
      amount: toNum(amount),
      amount_snapshot: toNum(amount),
      price: toNum(price || selected.price),
      price_snapshot: toNum(price || selected.price),
    };

    const normalized = (lines || []).map((l: any) => ({
      id: l.id,
      productname: l.productname_snapshot,
      amount: l.amount_snapshot,
      price: l.price_snapshot,
    }));

    setLines((prev) => [...prev, optimistic]);

    try {
      const res = await invoiceLineService.addLine(
        invoiceId,
        selected,
        optimistic.amount,
        optimistic.price
      );

      setLines((prev) =>
        prev.map((l) =>
          l.id === tempId ? { ...l, id: res.data.id } : l
        )
      );
    } catch (err) {
      console.error(err);
      setLines((prev) => prev.filter((l) => l.id !== tempId));
    }
  };

  // ---------------- UPDATE ----------------
  const updateLine = async (line: InvoiceLine) => {
    const backup = lines;

    setLines((prev) =>
      prev.map((l) => (l.id === line.id ? line : l))
    );

    try {
      await invoiceLineService.updateLine(line.id, {
        productname_snapshot: line.productname,
        amount_snapshot: toNum(line.amount),
        price_snapshot: toNum(line.price),
      });
    } catch (err) {
      console.error(err);
      setLines(backup);
    }
  };

  // ---------------- DELETE ----------------
  const deleteLine = async (id: number) => {
    const backup = lines;

    setLines((prev) => prev.filter((l) => l.id !== id));

    try {
      await invoiceLineService.deleteLine(id);
    } catch (err) {
      console.error(err);
      setLines(backup);
    }
  };

  return {
    lines,
    setLines,
    addLine,
    updateLine,
    deleteLine,
  };
}