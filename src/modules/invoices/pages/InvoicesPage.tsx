import React, { useState, useEffect } from "react";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceModal from "../components/InvoiceModal";
import { InvoiceService } from "../services/InvoiceService";
import type { Invoice } from "../types/InvoiceTypes";
import { useSearchParams } from "react-router-dom";
import { formatDateES } from "../../../utils/date";
import { useNavigate } from "react-router-dom";



export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback: string) =>
    searchParams.get(key) || fallback;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(getParam("search", ""));
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Paid" | "Pending" | "Overdue"
  >(getParam("status", "All") as any);

  const [sortKey, setSortKey] = useState(
    getParam("sort", "id") as keyof Invoice
  );
  const navigate = useNavigate();

  const [sortAsc, setSortAsc] = useState(
    getParam("order", "asc") === "asc"
  );

  const [page, setPage] = useState(Number(getParam("page", "1")));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState<Invoice | null>(null);

  const pageSize = 10;

  // reload helper
  const reloadInvoices = async () => {
    const data = await InvoiceService.getAll();
    setInvoices(Array.isArray(data) ? data : []);
  };

  // LOAD DATA
  useEffect(() => {
    setLoading(true);
    InvoiceService.getAll()
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // URL SYNC
  useEffect(() => {
    setSearchParams({
      search,
      status: statusFilter,
      sort: String(sortKey),
      order: sortAsc ? "asc" : "desc",
      page: String(page),
    });
  }, [search, statusFilter, sortKey, sortAsc, page]);

  const handleDelete = async (id: number) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    await InvoiceService.remove(id);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setModalOpen(true);
  };

  const handleSortChange = (key: keyof Invoice, asc: boolean) => {
    setSortKey(key);
    setSortAsc(asc);
  };

  // FILTER + SORT
  const processedInvoices = invoices
    .filter((inv) =>
      (inv.customer ?? "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(
      (inv) =>
        statusFilter === "All" || inv.status === statusFilter
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

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoices</h2>

      {/* TOP BAR */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setModalOpen(true);
          }}
        >
          + Add Invoice
        </button>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as any)
          }
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* TABLE */}
      <InvoiceTable
        invoices={paginatedInvoices}
        onDelete={handleDelete}
        onEdit={handleEdit}
        sortKey={sortKey}
        sortAsc={sortAsc}
        onSortChange={handleSortChange}
      />

      {/* PAGINATION */}
      <div style={{ marginTop: 10 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page}
        </span>

        <button
          disabled={
            page * pageSize >= processedInvoices.length
          }
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
              rpa_customer_id: (editingInvoice as any)
                .customer_id,
              date: editingInvoice.date,
              status: editingInvoice.status,
            }
            : null
        }
        onClose={() => {
          setModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={async (data) => {
          if (editingInvoice) {
            const updated = await InvoiceService.update(
              editingInvoice.id,
              {
                status: data.status,
                date: data.date,
                rpa_customer_id: Number(data.rpa_customer_id),
              }
            );

            if (updated) {
              await reloadInvoices();
            }
          } else {
            const created = await InvoiceService.create({
              status: data.status ?? "Pending",
              date: data.date,
              rpa_customer_id: Number(data.rpa_customer_id),
            });

            if (created) {
              // 🔥 REFRESH LIST
              await reloadInvoices();

              // 🚀 NAVIGATE TO DETAIL PAGE
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