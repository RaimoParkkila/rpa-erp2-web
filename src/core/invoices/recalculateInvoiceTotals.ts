export const recalculateInvoiceTotals = (lines: any[]) => {
  const subtotal = lines.reduce((sum, l) => {
    const qty = Number(l.amount ?? l.amount_snapshot ?? 0);
    const price = Number(l.price ?? l.price_snapshot ?? 0);

    return sum + qty * price;
  }, 0);

  const taxRate = 0.24;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
  };
};