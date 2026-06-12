export type InvoiceDTO = {
  id: number;
  customerId: number;
  customerName?: string;

  date: string; // YYYY-MM-DD
  status: "Pending" | "Paid" | "Overdue";

  total: number;
};