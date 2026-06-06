export type Invoice = {
  id: number;
  rpa_customer_id: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  date: string;
  total?: number;
};

export interface InvoiceForm {
  id?: number;
  rpa_customer_id: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
}