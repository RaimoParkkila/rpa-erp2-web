import { InvoiceDTO } from "../types/InvoiceDTO";
import { InvoiceEntity } from "../types/InvoiceEntity";

export const mapInvoiceToDTO = (inv: InvoiceEntity): InvoiceDTO => {
  return {
    id: inv.id,
    customerId: inv.rpa_customer_id,
    customerName: inv.customer,

    date: inv.date ? inv.date.split("T")[0] : "",
    status: mapStatus(inv.status),
    total: inv.total ?? 0,
  };
};

export const mapInvoiceToEntity = (dto: Partial<InvoiceDTO>): Partial<InvoiceEntity> => {
  return {
    rpa_customer_id: dto.customerId,
    date: dto.date,
    status: mapStatusReverse(dto.status),
    total: dto.total,
  };
};

export const mapStatus = (status: InvoiceEntity["status"]): InvoiceDTO["status"] => {
  switch (status) {
    case "PAID":
      return "Paid";
    case "OVERDUE":
      return "Overdue";
    default:
      return "Pending";
  }
};

export const mapStatusReverse = (status?: InvoiceDTO["status"]): InvoiceEntity["status"] => {
  switch (status) {
    case "Paid":
      return "PAID";
    case "Overdue":
      return "OVERDUE";
    default:
      return "DRAFT";
  }
};