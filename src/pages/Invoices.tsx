import { useEffect, useState } from "react";
import { fetchInvoices, updateInvoiceStatus } from "../services/invoiceService";
import { nextInvoiceStatus, isInvoiceLocked } from "../utils/invoiceRules";
import { useNavigate } from "react-router-dom";

type Invoice = {
    id: number;
    status: string;
    rpa_customer_id: number;
};

export default function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("ALL");
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchInvoices();

        if (error) {
            setError("Failed to load invoices");
            setLoading(false);
            return;
        }

        setInvoices(data || []);
        setLoading(false);
    }

    async function updateStatus(id: number, status: string) {
        setError(null);

        const { error } = await updateInvoiceStatus(id, status);

        if (error) {
            setError("Failed to update invoice status");
            return;
        }

        setInvoices((prev) =>
            prev.map((inv) =>
                inv.id === id ? { ...inv, status } : inv
            )
        );
    }

    const statusBadge = (status: string) => {
        const base: React.CSSProperties = {
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            display: "inline-block",
        };

        switch (status) {
            case "DRAFT":
                return (
                    <span style={{ ...base, background: "#2a2a2a", color: "#aaa" }}>
                        DRAFT
                    </span>
                );
            case "SENT":
                return (
                    <span style={{ ...base, background: "#1e3a5f", color: "#4da3ff" }}>
                        SENT
                    </span>
                );
            case "PAID":
                return (
                    <span style={{ ...base, background: "#1f3d2b", color: "#3dff9a" }}>
                        PAID
                    </span>
                );
            default:
                return <span style={base}>{status}</span>;
        }
    };

    const filteredInvoices =
        filter === "ALL"
            ? invoices
            : invoices.filter((inv) => inv.status === filter);

    return (
        <div
            style={{
                color: "white",
                display: "flex",
                justifyContent: "center",
            }}
        >
            {/* CENTER CONTAINER */}
            <div style={{ width: "100%", maxWidth: 1100 }}>

                {/* HEADER */}
                <h1 style={{ marginBottom: 10 }}>Invoices</h1>

                {/* ERROR */}
                {error && (
                    <div
                        style={{
                            background: "#3a1f1f",
                            color: "#ff6b6b",
                            padding: 10,
                            marginBottom: 10,
                            borderRadius: 6,
                        }}
                    >
                        {error}
                    </div>
                )}

                {loading && <p>Loading...</p>}

                {!loading && (
                    <>
                        {/* FILTERS */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                            {["ALL", "DRAFT", "SENT", "PAID"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "999px",
                                        border: "1px solid #333",
                                        background: filter === s ? "#00ffcc" : "#1e1e1e",
                                        color: filter === s ? "#000" : "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* TABLE WRAPPER */}
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    background: "#111",
                                    color: "white",
                                }}
                            >
                                <thead style={{ background: "#1a1a1a" }}>
                                    <tr>
                                        <th style={th}>ID</th>
                                        <th style={th}>Status</th>
                                        <th style={th}>Customer ID</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredInvoices.map((inv, i) => (
                                        <tr
                                            key={inv.id}
                                            onClick={() => navigate(`/invoices/${inv.id}`)}
                                            style={{
                                                background:
                                                    i % 2 === 0 ? "#121212" : "#0f0f0f",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = "#1a1a1a")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    i % 2 === 0 ? "#121212" : "#0f0f0f")
                                            }
                                        >
                                            <td style={td}>{inv.id}</td>

                                            <td
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    if (isInvoiceLocked(inv.status)) return;

                                                    const newStatus =
                                                        nextInvoiceStatus(inv.status);
                                                    updateStatus(inv.id, newStatus);
                                                }}
                                                style={{
                                                    cursor: isInvoiceLocked(inv.status)
                                                        ? "not-allowed"
                                                        : "pointer",
                                                    opacity: isInvoiceLocked(inv.status)
                                                        ? 0.5
                                                        : 1,
                                                }}
                                            >
                                                {statusBadge(inv.status)}
                                            </td>

                                            <td style={td}>{inv.rpa_customer_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px",
    borderBottom: "1px solid #333",
    color: "#aaa",
    fontSize: "12px",
    textTransform: "uppercase",
};

const td: React.CSSProperties = {
    padding: "10px",
    borderBottom: "1px solid #222",
};