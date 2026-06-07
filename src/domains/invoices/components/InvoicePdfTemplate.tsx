import React from "react";

export default function InvoicePdfTemplate({ data }: any) {
  const lines = data?.lines ?? [];

  const subtotal = lines.reduce(
    (sum: number, l: any) =>
      sum + Number(l.price || 0) * Number(l.amount || 0),
    0
  );

  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return (
    <div
      id="invoice-pdf"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        background: "white",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>INVOICE</h2>
          <p style={{ margin: 0 }}>Invoice #{data?.id}</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0 }}>
            <b>Date:</b> {data?.date}
          </p>
          <p style={{ margin: 0 }}>
            <b>Status:</b> {data?.status}
          </p>
        </div>
      </div>

      <hr />

      {/* CUSTOMER */}
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <h4 style={{ marginBottom: 5 }}>Customer</h4>
        <p style={{ margin: 0 }}>{data?.customer?.firstname ?? "-"}</p>
      </div>

      {/* TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 10,
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #000" }}>
            <th style={{ textAlign: "left", padding: "10px 0" }}>
              Product
            </th>
            <th style={{ textAlign: "center" }}>Qty</th>
            <th style={{ textAlign: "right" }}>Price</th>
            <th style={{ textAlign: "right" }}>Total</th>
          </tr>
        </thead>

        <tbody>
          {lines.map((l: any, index: number) => (
            <tr
              key={l.id}
              style={{
                background: index % 2 === 0 ? "#fafafa" : "white",
              }}
            >
              <td style={{ padding: "10px 0", textAlign: "left" }}>
                {l.productname}
              </td>

              <td style={{ textAlign: "center" }}>
                {Number(l.amount || 0)}
              </td>

              <td style={{ textAlign: "right" }}>
                {Number(l.price || 0).toFixed(2)}
              </td>

              <td style={{ textAlign: "right", fontWeight: 500 }}>
                {(Number(l.price || 0) * Number(l.amount || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div style={{ marginTop: 30, textAlign: "right" }}>
        <div>Subtotal: €{subtotal.toFixed(2)}</div>
        <div>VAT (21%): €{vat.toFixed(2)}</div>

        <h3 style={{ marginTop: 10 }}>
          Total: €{total.toFixed(2)}
        </h3>
      </div>

      {/* FOOTER (FIXED) */}
      <div
        style={{
          marginTop: 40,
          fontSize: 12,
        }}
      >
        <hr />
        <p style={{ marginTop: 10 }}>Thank you for your business</p>
      </div>
    </div>
  );
}