export const recalculateInvoiceTotals = (lines: any[]) => {
  const subtotal = lines.reduce((sum, l) => {
    const qty = Number(l.qty ?? 0);
    const price = Number(l.price ?? 0);
    return sum + qty * price;
  }, 0);

  const taxRate = 0.24; // myöhemmin domainista
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
  };
};