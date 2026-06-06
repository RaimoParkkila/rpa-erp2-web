import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

type Product = {
  id: number;
  productname: string;
  brand: string;
  model: string;
  price: number;
  status?: string | null;
  image_url?: string | null;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [brandFilter, setBrandFilter] = useState("ALL");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [sort, setSort] = useState("NONE");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);



  const [newProduct, setNewProduct] = useState({
    productname: "",
    brand: "",
    model: "",
    price: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const removeBrandFilter = () => setBrandFilter("ALL");
  const removeMinPrice = () => setMinPrice("");
  const removeMaxPrice = () => setMaxPrice("");
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  // ================= FETCH =================
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_shop_product")
      .select("id, productname, brand, model, price, status, image_url");

    if (error) console.error(error);
    else setProducts((data as Product[]) || []);

    setLoading(false);
  }

  // ================= DELETE (FIXED) =================
  async function deleteProduct(id: number) {
    const ok = window.confirm("Delete product?");
    if (!ok) return;

    const { error } = await supabase
      .from("rpa_shop_product")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  // ================= EDIT SAVE =================
  async function saveEdit() {
    if (!editProduct || editingId === null) return;

    const { error } = await supabase
      .from("rpa_shop_product")
      .update({
        productname: editProduct.productname,
        brand: editProduct.brand,
        model: editProduct.model,
        price: editProduct.price,
      })
      .eq("id", editingId);

    if (error) {
      console.error(error);
      return;
    }

    setEditingId(null);
    setEditProduct(null);
    fetchProducts();
  }

  // ================= ADD PRODUCT =================
  async function addProduct() {
    let imageUrl = "";

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("rpa_shop_product").insert({
      productname: newProduct.productname,
      brand: newProduct.brand,
      model: newProduct.model,
      price: newProduct.price,
      image_url: imageUrl,
    });

    if (error) {
      console.error(error);
      return;
    }

    setNewProduct({
      productname: "",
      brand: "",
      model: "",
      price: 0,
    });

    setImageFile(null);
    fetchProducts();
  }

  // ================= FILTER =================
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const filteredProducts = products.filter((p) => {
    const name = (p.productname ?? "").toLowerCase();
    const brand = (p.brand ?? "").toLowerCase();
    const model = (p.model ?? "").toLowerCase();

    return (
      (brandFilter === "ALL" || p.brand === brandFilter) &&
      (minPrice === "" || p.price >= Number(minPrice)) &&
      (maxPrice === "" || p.price <= Number(maxPrice)) &&
      (search === "" ||
        name.includes(search.toLowerCase()) ||
        brand.includes(search.toLowerCase()) ||
        model.includes(search.toLowerCase()))
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort) {
      case "PRICE_ASC":
        return a.price - b.price;
      case "PRICE_DESC":
        return b.price - a.price;
      case "NAME_AZ":
        return a.productname.localeCompare(b.productname);
      case "NAME_ZA":
        return b.productname.localeCompare(a.productname);
      default:
        return 0;
    }
  });

  // ================= UI =================
  return (
    <div style={{ padding: 20, background: "#0f0f0f", color: "white" }}>
      <h2>Products</h2>

      {/* ADD */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          value={newProduct.productname}
          onChange={(e) =>
            setNewProduct({ ...newProduct, productname: e.target.value })
          }
        />

        <input
          placeholder="Brand"
          value={newProduct.brand}
          onChange={(e) =>
            setNewProduct({ ...newProduct, brand: e.target.value })
          }
        />

        <input
          placeholder="Model"
          value={newProduct.model}
          onChange={(e) =>
            setNewProduct({ ...newProduct, model: e.target.value })
          }
        />

        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />

        <input
          type="file"
          onChange={(e) =>
            e.target.files && setImageFile(e.target.files[0])
          }
        />

        <button onClick={addProduct}>Add</button>
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} />

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="ALL">ALL</option>
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.map((p) => (
              <tr key={p.id}>

                {/* IMAGE COLUMN (PUUTTUI) */}
                <td>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        cursor: "zoom-in",
                      }}
                      onMouseMove={(e) => {
                        setHoverPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseEnter={(e) => {
                        setHoverImage(p.image_url || null);
                        setHoverPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoverImage(null);
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </td>

                <td onClick={() => navigate(`/products/${p.id}`)}>
                  {p.productname}
                </td>

                <td>{p.brand}</td>
                <td>{p.model}</td>
                <td>€{p.price}</td>

                <td>
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setEditProduct(p);
                    }}
                  >
                    Edit
                  </button>

                  <button onClick={() => deleteProduct(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* EDIT MODAL SIMPLE */}
      {editingId !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>Edit Product</h3>

          <input
            value={editProduct?.productname || ""}
            onChange={(e) =>
              setEditProduct({
                ...editProduct,
                productname: e.target.value,
              })
            }
          />

          <input
            value={editProduct?.brand || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, brand: e.target.value })
            }
          />

          <input
            value={editProduct?.model || ""}
            onChange={(e) =>
              setEditProduct({ ...editProduct, model: e.target.value })
            }
          />

          <input
            type="number"
            value={editProduct?.price || 0}
            onChange={(e) =>
              setEditProduct({
                ...editProduct,
                price: Number(e.target.value),
              })
            }
          />

          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}
      {hoverImage && (
        <div
          style={{
            position: "fixed",
            top: hoverPos.y + 15,
            left: hoverPos.x + 15,
            pointerEvents: "none",
            zIndex: 9999,
            background: "#000",
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid #333",
          }}
        >
          <img
            src={hoverImage}
            style={{
              width: "250px",
              height: "250px",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />
        </div>
      )}
    </div>
  );
}