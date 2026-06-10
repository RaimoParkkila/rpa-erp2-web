import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from "../services/ProductService";

type Product = {
  id: number;
  productname: string;
  brand: string;
  model: string;
  price: number;
  image_url?: string | null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProduct() {
    setLoading(true);

    try {
      const data = await ProductService.getById(Number(id));
      setProduct(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>

      {/* NAV */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20
      }}>
        <button onClick={() => navigate("/products")}>
          ← Back to Products
        </button>

        <button onClick={() => navigate("/shop")}>
          ← Shop
        </button>
      </div>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <div>
          <h1>{product.productname}</h1>
          <p style={{ color: "#666" }}>
            {product.brand} / {product.model}
          </p>
        </div>

        <div style={{
          textAlign: "right"
        }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>
            €{product.price}
          </div>

          <div style={{ fontSize: 12, color: "#888" }}>
            Product ID: {product.id}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 20
      }}>

        {/* LEFT: IMAGE + INFO */}
        <div style={{
          background: "#1e1e1e",
          padding: 20,
          borderRadius: 10
        }}>
          {product.image_url && (
            <img
              src={product.image_url}
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 10,
                marginBottom: 15
              }}
            />
          )}

          <h3>Product Overview</h3>

          <p><b>Name:</b> {product.productname}</p>
          <p><b>Brand:</b> {product.brand}</p>
          <p><b>Model:</b> {product.model}</p>
          <p><b>Price:</b> €{product.price}</p>
        </div>

        {/* RIGHT: ERP PANEL */}
        <div style={{
          background: "#1e1e1e",
          padding: 20,
          borderRadius: 10,
          height: "fit-content"
        }}>
          <h3>ERP Controls</h3>

          <button style={{ width: "100%", marginBottom: 10 }}>
            ✏️ Edit Product
          </button>

          <button style={{ width: "100%", marginBottom: 10 }}>
            💰 Update Price
          </button>

          <button style={{
            width: "100%",
            marginBottom: 10,
            color: "red"
          }}>
            ⛔ Deactivate
          </button>

          <hr style={{ margin: "15px 0" }} />

          <h4>Business Data</h4>

          <p style={{ fontSize: 12 }}>
            • Invoices: (future link)<br />
            • Sales: (future stats)<br />
            • Stock: (future module)
          </p>
        </div>
      </div>
    </div>
  );
}