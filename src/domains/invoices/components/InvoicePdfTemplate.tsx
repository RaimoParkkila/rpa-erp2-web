export default function InvoicePdfTemplate({ data, lines }: any) {
  const safeLines = lines ?? [];

  const subtotal = safeLines.reduce(
    (s: number, l: any) =>
      s + (Number(l.amount_snapshot || 0) * Number(l.price_snapshot || 0)),
    0
  );

  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#fff",
      }}
    >
      {/* 🔥 INNER PAGE (REAL MARGINS CONTROL) */}
      <div
        style={{
          padding: "20mm",
          boxSizing: "border-box",
          width: "100%",
          fontFamily: "Arial",
          color: "#111",
          position: "relative",
        }}
      >
        {/* HEADER BOX */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
            backgroundColor: "#fafafa",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: 2,
              fontWeight: 900,
              color: "#000",
            }}
          >
            INVOICE
          </h1>

          <div style={{ fontSize: 12, marginTop: 6 }}>
            Invoice #{data?.id}
          </div>

          <div style={{ fontSize: 12 }}>
            Date: {data?.date}
          </div>
        </div>

        {/* CUSTOMER */}
        <div style={{ marginBottom: 20, fontSize: 12 }}>
          <strong>Customer:</strong>{" "}
          {data?.customerName ?? "Unknown customer"}
        </div>

        {/* TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            overflowWrap: "break-word",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #000" }}>
              <th align="left" style={{ textAlign: "left" }}>
                Product
              </th>
              <th align="right">Qty</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
            </tr>
          </thead>

          <tbody>
            {safeLines.map((l: any, index: number) => (
              <tr
                key={l.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f2f2f2",
                }}
              >
                <td
                  style={{
                    textAlign: "left",      // 🔥 FORCE LEFT ALIGN
                    wordBreak: "break-word",
                  }}
                >
                  {l.productname_snapshot}
                </td>

                <td align="right">
                  {Number(l.amount_snapshot || 0)}
                </td>

                <td align="right">
                  {Number(l.price_snapshot || 0).toFixed(2)}
                </td>

                <td align="right">
                  {(
                    Number(l.amount_snapshot || 0) *
                    Number(l.price_snapshot || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div
          style={{
            marginTop: 30,
            textAlign: "right",
            borderTop: "2px solid #000",
            paddingTop: 10,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 12 }}>
            Subtotal: €{subtotal.toFixed(2)}
          </div>

          <div style={{ fontSize: 12 }}>
            VAT (21%): €{vat.toFixed(2)}
          </div>

          <h2
            style={{
              marginTop: 10,
              fontWeight: 900,
              color: "#000",
              fontSize: 22,
              letterSpacing: 1,
            }}
          >
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
    </div>
  );
}