// InvoiceTypes.ts

export type DbInvoiceStatus = "DRAFT" | "PAID" | "OVERDUE";
export type UiInvoiceStatus = "Paid" | "Pending" | "Overdue";

export interface InvoiceForm {
  id?: number;
  rpa_customer_id: number;
  date: string;

  // UI status (modaalit ja table)
  status: UiInvoiceStatus;

  // DB status (save / fetch mapping)
  db_status?: DbInvoiceStatus;
}

export interface Invoice {
  id: number;
  rpa_customer_id: number;

  // joinattu nimi
  customer?: string;

  date: string;

  // UI:ssa käytettävä status
  status: UiInvoiceStatus;

  subtotal: number;
  tax: number;
  total: number;

  // (valinnainen debug / sync)
  db_status?: DbInvoiceStatus;
}