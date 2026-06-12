import React, { useState, useEffect } from "react";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceModal from "../components/InvoiceModal";
import { InvoiceService } from "../services/InvoiceService";
import { InvoiceDetailService } from "../services/InvoiceDetailService";
import type { Invoice } from "../types/InvoiceTypes";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StatusChip } from "../../../shared/components/StatusChip";

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const getParam = (key: string, fallback: string) =>
    searchParams.get(key) || fallback;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(getParam("search", ""));
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Paid" | "Pending" | "Overdue">(
      getParam("status", "All") as any
    );

  const [sortKey, setSortKey] = useState(
    getParam("sort", "id") as keyof Invoice
  );

  const [sortAsc, setSortAsc] = useState(
    getParam("order", "asc") === "asc"
  );

  const [page, setPage] = useState(Number(getParam("page", "1")));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  const pageSize = 10;

  // ---------------- STATUS MAP (DB → UI) ----------------
  const mapStatus = (status: string) => {
    switch (status) {
      case "DRAFT":
      case "SENT":
        return "Pending";
      case "PAID":
        return "Paid";
      case "OVERDUE":
        return "Overdue";
      default:
        return "Pending";
    }
  };

  // ---------------- STATUS MAP (UI → DB) ----------------
  const mapStatusReverse = (status: string) => {
    switch (status) {
      case "Pending":
        return "DRAFT";
      case "Paid":
        return "PAID";
      case "Overdue":
        return "OVERDUE";
      default:
        return "DRAFT";
    }
  };

  useEffect(() => {
    setLoading(true);
    InvoiceService.getAll()
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchParams({
      search,
      status: statusFilter,
      sort: String(sortKey),
      order: sortAsc ? "asc" : "desc",
      page: String(page),
    });
  }, [search, statusFilter, sortKey, sortAsc, page]);

  const reloadInvoices = async () => {
    const data = await InvoiceService.getAll();
    setInvoices(Array.isArray(data) ? data : []);
  };

  const handleDelete = async (id: number) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    await InvoiceService.remove(id);
  };

  const handleEdit = async (invoice: Invoice) => {
    console.log("🟡 EDIT CLICK:", invoice);

    alert(
      `EDIT INVOICE\nID: ${invoice.id}\nSTATUS: ${invoice.status}\nTOTAL: ${invoice.total}`
    );

    setEditingInvoice(invoice);
    setModalOpen(true);
  };

  const handleSortChange = (key: keyof Invoice, asc: boolean) => {
    setSortKey(key);
    setSortAsc(asc);
  };

  const processedInvoices = invoices
    .filter((inv) =>
      (inv.customer ?? "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(
      (inv) =>
        statusFilter === "All" ||
        mapStatus(inv.status) === statusFilter
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }

      return sortAsc
        ? String(valA ?? "").localeCompare(String(valB ?? ""))
        : String(valB ?? "").localeCompare(String(valA ?? ""));
    });

  const paginatedInvoices = processedInvoices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #2a2a2a",
    padding: 15,
    borderRadius: 10,
    minWidth: 140,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "#111",
    color: "white",
    cursor: "pointer",
    minWidth: 80,
  };

  const td: React.CSSProperties = {
    padding: 10,
    fontSize: 13,
  };

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading invoices...</div>;
  }

  return (
    <div style={{ color: "white" }}>

      {/* HEADER */}
      <div style={{ marginTop: 12 }}>
        <button
          style={buttonStyle}
          onClick={() => {
            setEditingInvoice(null);
            setModalOpen(true);
          }}
        >
          + New Invoice
        </button>

        <div style={{ marginTop: 18, opacity: 0.6 }}>
          Invoices & billing management
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Invoices</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>{invoices.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Paid</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {invoices.filter(i => mapStatus(i.status) === "Paid").length}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Pending</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {invoices.filter(i => mapStatus(i.status) === "Pending").length}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ opacity: 0.7 }}>Overdue</div>
          <div style={{ fontSize: 26, fontWeight: "bold" }}>
            {invoices.filter(i => mapStatus(i.status) === "Overdue").length}
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoices..."
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #333",
            background: "#111",
            color: "white",
            width: "100%",
            maxWidth: 320,
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #333",
            background: "#111",
            color: "white",
          }}
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#0f0f0f",
          borderRadius: 10,
          overflow: "hidden",
        }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              <th style={td}>ID</th>
              <th style={td}>Customer</th>
              <th style={td}>Date</th>
              <th style={td}>Status</th>
              <th style={td}>Total</th>
              <th style={td}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedInvoices.map((inv) => (
              <tr key={inv.id}>
                <td style={td}>#{inv.id}</td>
                <td style={td}>{inv.customer}</td>
                <td style={td}>{inv.date}</td>

                <td style={td}>
                  <StatusChip status={mapStatus(inv.status)} />
                </td>

                <td style={td}>{inv.total ?? "-"}</td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={buttonStyle} onClick={() => handleEdit(inv)}>
                      Edit
                    </button>
                    <button style={buttonStyle} onClick={() => handleDelete(inv.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div style={{ marginTop: 10 }}>
        <button style={buttonStyle} disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>Page {page}</span>

        <button
          style={buttonStyle}
          disabled={page * pageSize >= processedInvoices.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      <InvoiceModal
        isOpen={modalOpen}
        initialData={
          editingInvoice
            ? {
              id: editingInvoice.id,
              customer: editingInvoice.customer ?? "",
              rpa_customer_id: editingInvoice.rpa_customer_id ?? null,
              date: editingInvoice.date
                ? editingInvoice.date.split("T")[0]
                : "",
              status: mapStatus(editingInvoice.status ?? "DRAFT"),
              total: editingInvoice.total ?? 0,
              subtotal: editingInvoice.subtotal ?? 0,
            }
            : {
              customer: "",
              rpa_customer_id: null,
              date: "",
              status: "Pending",
            }
        }
        onClose={() => {
          setModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={async (data) => {
          if (editingInvoice) {
            await InvoiceService.update(editingInvoice.id, {
              status: mapStatusReverse(data.status ?? "Pending"),
              date: data.date,
              rpa_customer_id: Number(data.rpa_customer_id),
            });

            await reloadInvoices();
          } else {
            const created = await InvoiceService.create({
              status: mapStatusReverse(data.status ?? "Pending"),
              date: data.date,
              rpa_customer_id: Number(data.rpa_customer_id),
            });

            if (created) {
              await reloadInvoices();
              navigate(`/invoices/${created.id}`);
            }
          }

          setModalOpen(false);
          setEditingInvoice(null);
        }}
      />
    </div>
  );
}