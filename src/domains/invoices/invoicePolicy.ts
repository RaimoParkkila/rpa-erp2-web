export function isInvoiceEditable(status?: string) {
  return ["draft", "pending"].includes(
    String(status ?? "").toLowerCase()
  );
}