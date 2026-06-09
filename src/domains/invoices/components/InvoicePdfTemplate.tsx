export default function InvoicePdfTemplate({ data, lines }: any) {
  const subtotal = lines.reduce(
    (s: number, l: any) =>
      s + (l.amount_snapshot * l.price_snapshot),
    0
  );

  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        fontFamily: "Arial",
        color: "#111",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 25 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 2 }}>
          INVOICE
        </h1>

        <div style={{ fontSize: 12, marginTop: 6 }}>
          Invoice #{data.id}
        </div>

        <div style={{ fontSize: 12 }}>
          Date: {data.date}
        </div>
      </div>

      {/* CUSTOMER */}
      <div style={{ marginBottom: 20, fontSize: 12 }}>
        <strong>Customer ID:</strong> {data.rpa_customer_id}
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th align="left">Product</th>
            <th align="right">Qty</th>
            <th align="right">Price</th>
            <th align="right">Total</th>
          </tr>
        </thead>

        <tbody>
          {lines.map((l: any) => (
            <tr key={l.id}>
              <td>{l.productname_snapshot}</td>
              <td align="right">{l.amount_snapshot}</td>
              <td align="right">
                {Number(l.price_snapshot).toFixed(2)}
              </td>
              <td align="right">
                {(l.amount_snapshot * l.price_snapshot).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: 30, textAlign: "right" }}>
        <div>Subtotal: €{subtotal.toFixed(2)}</div>
        <div>VAT (21%): €{vat.toFixed(2)}</div>

        <h2 style={{ marginTop: 10 }}>
          Total: €{total.toFixed(2)}
        </h2>
      </div>

      {/* FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          fontSize: 10,
          textAlign: "center",
          color: "#777",
        }}
      >
        Thank you for your business
      </div>
    </div>
  );
}