import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

type InvoiceView = {
  id: number;
  status: string;
  rpa_customer_id: number;
  customer_name?: string;
  customer_email?: string;
};

export default function InvoicesJoined() {
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: invoicesData, error: invError } = await supabase
      .from("rpaheaderofinvoice")
      .select("*");

    const { data: customersData, error: custError } = await supabase
      .from("rpa_customer")
      .select("*");

    if (invError || custError) {
      console.error(invError || custError);
      setLoading(false);
      return;
    }

    const joined = (invoicesData || []).map((inv: any) => {
      const customer = (customersData || []).find(
        (c: any) => c.id === inv.rpa_customer_id
      );

      return {
        ...inv,
        customer_name: customer?.firstname || "-",
        customer_email: customer?.email || "-",
      };
    });

    setInvoices(joined);
    setLoading(false);
  }

  return (
    <div>
      <h1>Invoices (JOIN → Customers)</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <table border={1} cellPadding={8} style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Status</th>
              <th>Customer Name</th>
              <th>Customer Email</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.status}</td>
                <td>{inv.customer_name}</td>
                <td>{inv.customer_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}