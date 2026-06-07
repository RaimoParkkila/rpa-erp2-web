import React from "react";
import type { Invoice } from "../types/InvoiceTypes";
import { formatDateES } from "../../../utils/date";

interface Props {
  invoices: Invoice[];
  onDelete: (id: number) => void;
  onEdit?: (invoice: Invoice) => void;
  sortKey: keyof Invoice;
  sortAsc: boolean;
  onSortChange: (key: keyof Invoice, asc: boolean) => void;
}

export default function InvoiceTable({
  invoices,
  onDelete,
  onEdit,
  sortKey,
  sortAsc,
  onSortChange,
}: Props) {
  const formatCurrency = (value?: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value ?? 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "#2e7d32";
      case "Pending":
        return "#ed6c02";
      case "Overdue":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  const handleHeaderClick = (key: keyof Invoice) => {
    if (key === sortKey) {
      onSortChange(key, !sortAsc);
    } else {
      onSortChange(key, true);
    }
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
          <th onClick={() => handleHeaderClick("id")}>
            ID {sortKey === "id" ? (sortAsc ? "▲" : "▼") : ""}
          </th>

          <th onClick={() => handleHeaderClick("customer")}>
            Customer {sortKey === "customer" ? (sortAsc ? "▲" : "▼") : ""}
          </th>

          <th onClick={() => handleHeaderClick("date")}>
            Date {sortKey === "date" ? (sortAsc ? "▲" : "▼") : ""}
          </th>

          <th onClick={() => handleHeaderClick("total")}>
            Total {sortKey === "total" ? (sortAsc ? "▲" : "▼") : ""}
          </th>

          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} style={{ borderBottom: "1px solid #eee" }}>
            <td>{inv.id}</td>

            <td>
              {typeof inv.customer === "string"
                ? inv.customer
                : inv.customer?.firstname ?? "Unknown"}
            </td>

            <td>{inv.date ? formatDateES(inv.date) : "-"}</td>

            <td>{formatCurrency(inv.total)}</td>

            <td>
              <span
                style={{
                  color: "white",
                  backgroundColor: getStatusColor(inv.status),
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                }}
              >
                {inv.status}
              </span>
            </td>

            <td>
              {onEdit && (
                <button
                  onClick={() => onEdit(inv)}
                  style={{ marginRight: "6px" }}
                >
                  Edit
                </button>
              )}
              <button onClick={() => onDelete(inv.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}