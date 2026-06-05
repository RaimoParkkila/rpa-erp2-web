import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { InvoiceDetailService } from "../services/InvoiceDetailService";
import { formatDateTimeES } from "../../../utils/date";
import { supabase } from "../../../services/supabase";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoicePdfTemplate from "../../../components/invoice/InvoicePdfTemplate";
type InvoiceStatus = "Draft" | "Sent" | "Paid";

type InvoiceLine = {
  id: number;
  productname_snapshot: string;
  price_snapshot: number;
  amount_snapshot: number;
};

type Invoice = {
  id: number;
  status: InvoiceStatus;
  date: string;
  customer?: any;
  lines: InvoiceLine[];
  total?: number;
};


export default function InvoiceDetail() {
  const { id } = useParams();
  const invoiceId = Number(id);

  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddLine, setShowAddLine] = useState(false);

  //const [lineProduct, setLineProduct] = useState("");
  const [lineAmount, setLineAmount] = useState(1);
  const [linePrice, setLinePrice] = useState<number>(0);

  const [editingLine, setEditingLine] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [lineProduct, setLineProduct] = useState<string>("");
  const productRef = useRef<HTMLSelectElement>(null);
  const [lastProductId, setLastProductId] = useState<number | null>(null);

  //const isLocked = data?.status ? data.status !== "Draft" : false;

  //const canSend = data?.status === "Draft";
  //const canPay = data?.status === "Sent";

  //const status = data?.status ?? "Draft";
  //const status = data?.status;
  //const status = data?.status?.toUpperCase?.();
  const status = data?.status?.toUpperCase();

  const isLocked = status !== "DRAFT";
  const isDraft = status === "DRAFT";
  const isSent = status === "SENT";
  const isPaid = status === "PAID";

  const toNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const calcLineTotal = (l: any) =>
    toNum(l.price) * toNum(l.amount);

  const calcSubtotal = (lines: any[]) =>
    lines.reduce((sum, l) => sum + calcLineTotal(l), 0);

 

  const getPrice = (l: any) => Number(l.price ?? 0);
const getAmount = (l: any) => Number(l.amount ?? 0);

const getLineTotal = (l: any) => getPrice(l) * getAmount(l);

  // -------------------------
  // RELOAD
  // -------------------------
  const reload = () => {
    if (!invoiceId) return;

    setLoading(true);
    InvoiceDetailService.getById(invoiceId).then((res) => {
      setData(res);
      setLoading(false);
    });
  };
  const lines = data?.lines ?? [];
  const subtotal = calcSubtotal(lines);
  const vat = subtotal * 0.21;
  const total = subtotal + vat;
  const exportPdf = async () => {
    const input = document.getElementById("invoice-pdf");

    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    pdf.save(`invoice-${data.id}.pdf`);
  };
  // -------------------------
  // LOAD INVOICE
  // -------------------------
  useEffect(() => {
    reload();
  }, [invoiceId]);

  // -------------------------
  // LOAD PRODUCTS
  // -------------------------
  useEffect(() => {
    supabase
      .from("rpa_shop_product")
      .select("id, productname, price")
      .then(({ data }) => {
        setProducts(data || []);
      });
  }, []);
  useEffect(() => {
    if (showAddLine) {

      // viimeksi käytetty tuote valmiiksi
      if (lastProductId) {
        const p = products.find(
          (x) => x.id === lastProductId
        );

        if (p) {
          setLineProduct(String(p.id));
          setLinePrice(p.price);
        }
      }

      // focus dropdowniin
      setTimeout(() => {
        productRef.current?.focus();
      }, 50);
    }
  }, [showAddLine, lastProductId, products]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setShowAddLine(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  // -------------------------
  // ADD LINE
  // -------------------------
  const handleAddLine = async () => {
    if (!invoiceId) return;

    const selectedProduct = products.find(
      (p) => Number(p.id) === Number(lineProduct)
    );

    if (!selectedProduct) return;

    const price =
      linePrice === "" || linePrice == null
        ? toNum(selectedProduct.price)
        : toNum(linePrice);

    const amount = toNum(lineAmount);

    const payload = {
      rpa_headerofinvoice_id: invoiceId,
      rpa_shop_product_id: selectedProduct.id,

      productname: selectedProduct.productname,
      price: price,
      amount: amount,
    };

    const { error } = await supabase
      .from("rpa_invoice_line")
      .insert(payload);

    if (error) {
      console.error(error);
      return;
    }

    setLastProductId(Number(lineProduct));

    setShowAddLine(false);
    setLineProduct("");
    setLineAmount(1);
    setLinePrice(0);

    reload();
  };
  // -------------------------
  // UPDATE LINE
  // -------------------------
  const handleUpdateLine = async () => {
    if (!editingLine) return;

    const { error } = await supabase
      .from("rpa_invoice_line")
      .update({
        rpa_shop_product_id: editingLine.rpa_shop_product_id,
        productname: editingLine.productname,
        price: editingLine.price,
        amount: editingLine.amount,
      })
      .eq("id", editingLine.id);

    if (error) {
      console.error(error);
      return;
    }

    setEditingLine(null);
    reload();
  };

  // -------------------------
  // DELETE LINE
  // -------------------------
  const handleDeleteLine = async (lineId: number) => {
    const { error } = await supabase
      .from("rpa_invoice_line")
      .delete()
      .eq("id", lineId);

    if (error) {
      console.error(error);
      return;
    }

    reload();
  };
  const setStatus = async (next: InvoiceStatus) => {
    if (!data) return;

    const current = data.status?.toUpperCase();

    if (next === "Sent" && current !== "DRAFT") return;
    if (next === "Paid" && current !== "SENT") return;

    const { error } = await supabase
      .from("rpaheaderofinvoice")
      .update({ status: next.toUpperCase() })
      .eq("id", invoiceId);

    if (!error) reload();
  };


  // -------------------------
  // LOADING
  // -------------------------
  if (loading) return <>Loading invoice...</>;
  if (!data) return <>No invoice found</>;
  console.log("PRODUCTS:", JSON.stringify(products));

  console.log("STATUS RAW:", data?.status);
  return (


    <>
      <h1>Invoice #{data.id}</h1>

      {/* STATUS */}
      <p>
        Status:{" "}
        {(() => {
          switch (data.status) {
            case "Paid":
              return <span style={{ color: "green" }}>Paid</span>;
            case "Pending":
              return <span style={{ color: "orange" }}>Pending</span>;
            case "Overdue":
              return <span style={{ color: "red" }}>Overdue</span>;
            default:
              return <span>{data.status}</span>;
          }
        })()}
      </p>

      <p>
        Customer: {data.customer?.firstname ?? data.rpa_customer_id ?? "-"}
      </p>

      <h2>Total: €{total.toFixed(2)}</h2>

      <button
        disabled={!isDraft}
        onClick={() => setShowAddLine(true)}
      >
        + Add Line
      </button>

      <button onClick={reload}>
        Refresh
      </button>

      <button onClick={exportPdf}>
        Export PDF
      </button>
      <div>
        <p><b>Date:</b> {formatDateTimeES(data.date)}</p>
        <p><b>Status:</b> {data.status}</p>
        <button
          onClick={() => setStatus("Sent")}
          disabled={status !== "DRAFT"}
        >
          Mark as Sent
        </button>

        <button
          onClick={() => setStatus("Paid")}
          disabled={status !== "SENT"}
        >
          Mark as Paid
        </button>
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.lines.map((l: any) => (
            <tr key={l.id}>
              <td style={{ textAlign: "left" }}>
                {l.productname ?? l.productname_snapshot}
              </td>
              <td>{l.amount}</td>
              <td>
              <td>{getPrice(l).toFixed(2)}</td>
              </td>
              <td>

                <td>{getLineTotal(l).toFixed(2)}</td>
              </td>

              <td>
                <button disabled={isLocked} onClick={() => setEditingLine(l)}>
                  Edit
                </button>
                <button disabled={isLocked} onClick={() => handleDeleteLine(l.id)}>
                  Delete
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD LINE MODAL */}
      {showAddLine && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div
            style={{ background: "white", padding: 20, width: 300 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddLine();
              }
            }}
          >
            <h3>Add Line</h3>

            {/* PRODUCT DROPDOWN */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Product
              </label>

              <select ref={productRef}
                value={lineProduct}
                onChange={(e) => {
                  const p = products.find(
                    (x) => x.id === Number(e.target.value)
                  );

                  setLineProduct(String(p?.id ?? ""));
                  setLinePrice(p?.price ?? 0);
                }}
                style={{ width: "100%", padding: 6 }}
              >
                <option value="">Select product</option>

                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productname}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              value={lineAmount}
              onChange={(e) => setLineAmount(Number(e.target.value))}
            />

            <input
              type="number"
              value={linePrice}
              onChange={(e) => setLinePrice(e.target.value)}
            />

            <button onClick={handleAddLine}>Save</button>
            <button onClick={() => setShowAddLine(false)}>Cancel</button>
          </div>
        </div>
      )}


      {/* EDIT LINE MODAL */}
      {/* EDIT LINE MODAL */}
      {/* EDIT LINE MODAL */}
      {editingLine && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              width: 360,
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Edit invoice line</h3>

            {/* PRODUCT */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Product
              </label>

              <select
                value={editingLine.rpa_shop_product_id || ""}
                onChange={(e) => {
                  const p = products.find(
                    (x) => x.id === Number(e.target.value)
                  );

                  setEditingLine({
                    ...editingLine,
                    rpa_shop_product_id: p?.id ?? null,
                    productname_snapshot: p?.productname ?? "",
                    price: p?.price ?? 0,
                  });
                }}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productname}
                  </option>
                ))}
              </select>
            </div>

            {/* AMOUNT */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Amount
              </label>

              <input
                type="number"
                value={editingLine.amount}
                onChange={(e) => {
                  setEditingLine({
                    ...editingLine,
                    amount: e.target.value,
                  });
                }}
              />
            </div>

            {/* PRICE */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Price
              </label>

              <input
                type="number"
                value={editingLine.price?.toString() ?? ""}
                onChange={(e) =>
                  setEditingLine({
                    ...editingLine,
                    price: Number(e.target.value || 0),
                  })
                }
                style={{ width: "100%", padding: 6 }}
              />
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleUpdateLine}>Save</button>
              <button onClick={() => setEditingLine(null)}>Cancel</button>

            </div>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <InvoicePdfTemplate data={data} />
      </div>
    </>
  );
}