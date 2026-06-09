export const validateInvoiceSnapshot = (lines: any[]) => {
  return lines.every((l) => {
    const qty = Number(l.qty);
    const price = Number(l.price);

    if (!l) return false;
    if (qty <= 0) return false;
    if (price < 0) return false;

    return true;
  });
};