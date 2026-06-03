import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

type Customer = {
    id: number;
    firstname: string;
};

type Invoice = {
    id: number;
    status: string;
    rpa_customer_id: number;
};

type InvoiceLine = {
    id: number;
    productname: string;
    price: number;
    amount: number;
};

export default function InvoiceDetail() {
    const { id } = useParams();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [lines, setLines] = useState<InvoiceLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        fetchInvoice();
    }, []);

    async function fetchInvoice() {
        setLoading(true);

        const { data: invoiceData, error: invoiceError } =
            await supabase
                .from("rpaheaderofinvoice")
                .select("*")
                .eq("id", id)
                .single();

        if (invoiceError) {
            console.error(invoiceError);
        } else {
            setInvoice(invoiceData);
        }
        if (invoiceData?.rpa_customer_id) {
            const { data: customerData, error: customerError } =
                await supabase
                    .from("rpa_customer")
                    .select("id, firstname")
                    .eq("id", invoiceData.rpa_customer_id)
                    .single();

            if (customerError) {
                console.error(customerError);
            } else {
                setCustomer(customerData);
            }
        }

        const { data: lineData, error: lineError } =
            await supabase
                .from("rpa_invoice_line")
                .select("*")
                .eq("rpa_headerofinvoice_id", id);

        if (lineError) {
            console.error(lineError);
        } else {
            setLines(lineData || []);
        }

        setLoading(false);
    }

    const total = lines.reduce(
        (sum, line) => sum + ((line.price || 0) * (line.amount || 0)),
        0
    );

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "20px",
                color: "white",
            }}
        >
            <h1>Invoice #{id}</h1>

            {loading && <p>Loading...</p>}

            {!loading && invoice && (
                <>
                    <div
                        style={{
                            background: "#1e1e1e",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            padding: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <p>
                            <strong>Status:</strong> {invoice.status}
                        </p>

                        <p>
                            <strong>Customer:</strong>{" "}
                            {customer ? customer.firstname : `ID ${invoice.rpa_customer_id}`}
                        </p>

                        <h2>Total: €{total}</h2>
                    </div>

                    <h2>Invoice Lines</h2>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#1e1e1e",
                            color: "white",
                        }}
                    >
                        <thead
                            style={{
                                background: "#333",
                            }}
                        >
                            <tr>
                                <th style={{ padding: "10px" }}>Product</th>
                                <th style={{ padding: "10px" }}>Amount</th>
                                <th style={{ padding: "10px" }}>Price</th>
                                <th style={{ padding: "10px" }}>Line Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lines.map((line) => (
                                <tr
                                    key={line.id}
                                    style={{
                                        borderTop: "1px solid #444",
                                    }}
                                >
                                    <td style={{ padding: "10px" }}>
                                        {line.productname}
                                    </td>

                                    <td style={{ padding: "10px" }}>
                                        {line.amount}
                                    </td>

                                    <td style={{ padding: "10px" }}>
                                        €{line.price}
                                    </td>

                                    <td style={{ padding: "10px" }}>
                                        €{line.price * line.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}