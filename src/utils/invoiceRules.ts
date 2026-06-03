export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  PAID: "PAID",
} as const;

export function nextInvoiceStatus(status: string) {
  if (status === "DRAFT") return "SENT";
  if (status === "SENT") return "PAID";
  return "PAID";
}

export function isInvoiceLocked(status: string) {
  return status === "PAID";
}