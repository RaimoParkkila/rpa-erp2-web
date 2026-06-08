import { useState } from "react";

type Product = {
  id: number;
  productname: string;
  price: number;
};

type Props = {
  products: Product[];
  invoiceId: number;
  onAdded: () => void;
  invoiceLineService: {
    addLine: (
      invoiceId: number,
      product: Product,
      amount: number,
      price: number
    ) => Promise<any>;
  };
};

export default function AddInvoiceLine({
  products,
  invoiceId,
  onAdded,
  invoiceLineService,
}: Props) {
  const [show, setShow] = useState(false);
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find(
    (p) => p.id === Number(productId)
  );

  const reset = () => {
    setProductId("");
    setAmount(1);
    setPrice(0);
  };

  const handleAdd = async () => {
    if (!invoiceId || !selectedProduct) return;

    setLoading(true);

    try {
      await invoiceLineService.addLine(
        invoiceId,
        selectedProduct,
        amount,
        price || selectedProduct.price
      );

      reset();
      setShow(false);
      onAdded();
    } catch (err) {
      console.error("ADD LINE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setShow(!show)} disabled={loading}>
        + Add Line
      </button>

      {show && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #ccc" }}>
          <div>
            <label>Product</label>
            <select
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);

                const p = products.find((x) => x.id === Number(id));
                setPrice(p?.price ?? 0);
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

          <div>
            <label>Amount</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 1)}
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={handleAdd} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setShow(false);
                reset();
              }}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}