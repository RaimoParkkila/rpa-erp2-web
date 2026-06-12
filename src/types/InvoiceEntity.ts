export type InvoiceEntity = {
  id: number;
  rpa_customer_id: number;
  customer?: string;

  date: string; // ISO
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";

  total: number;
};