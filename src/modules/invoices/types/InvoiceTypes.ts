// InvoiceTypes.ts

export interface InvoiceForm {
  id?: number;
  rpa_customer_id: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
}

export interface Invoice {
  id: number;
  rpa_customer_id: number;
  customerName?: string;

  date: string;
  status: "Paid" | "Pending" | "Overdue";

  subtotal: number;
  tax: number;
  total: number;
}
