export interface Invoice {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: "Paid" | "Pending" | "Overdue";
}

export interface InvoiceForm {
  id?: number;
  rpa_customer_id: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
}