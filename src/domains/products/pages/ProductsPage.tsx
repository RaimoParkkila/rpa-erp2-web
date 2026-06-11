import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase";
import { useNavigate } from "react-router-dom";
import { ProductService } from "../services/ProductService";

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

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function deleteProduct(id: number) {
    const ok = window.confirm("Delete product?");
    if (!ok) return;

    try {
      await ProductService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

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

    if (error) return console.error(error);

    setEditingId(null);
    setEditProduct(null);
    fetchProducts();
  }

  async function addProduct() {
    let imageUrl = "";

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) return console.error(uploadError);

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

    if (error) return console.error(error);

    setNewProduct({ productname: "", brand: "", model: "", price: 0 });
    setImageFile(null);
    fetchProducts();
  }

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

  return (
    <div style={{ padding: 20, background: "#0f0f0f", color: "white" }}>
      <h2 style={{ marginBottom: 15 }}>Products</h2>

      {/* ADD */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <input style={inputStyle} placeholder="Name"
          value={newProduct.productname}
          onChange={(e) => setNewProduct({ ...newProduct, productname: e.target.value })}
        />
        <input style={inputStyle} placeholder="Brand"
          value={newProduct.brand}
          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
        />
        <input style={inputStyle} placeholder="Model"
          value={newProduct.model}
          onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
        />
        <input style={inputStyle} type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
        />
        <input type="file" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
        <button style={btnStyle} onClick={addProduct}>Add</button>
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 15 }}>
        <input style={inputStyle} placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select style={inputStyle} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="ALL">ALL</option>
          {brands.map((b) => <option key={b}>{b}</option>)}
        </select>

        <select style={inputStyle} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="NONE">No sort</option>
          <option value="PRICE_ASC">Price ↑</option>
          <option value="PRICE_DESC">Price ↓</option>
          <option value="NAME_AZ">Name A-Z</option>
          <option value="NAME_ZA">Name Z-A</option>
        </select>

        <input style={inputStyle} placeholder="Min price" type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <input style={inputStyle} placeholder="Max price" type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <button style={btnStyle} onClick={removeBrandFilter}>Clear brand</button>
        <button style={btnStyle} onClick={removeMinPrice}>Clear min</button>
        <button style={btnStyle} onClick={removeMaxPrice}>Clear max</button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a1a1a" }}>
                <th style={th}>Image</th>
                <th style={th}>Name</th>
                <th style={th}>Brand</th>
                <th style={th}>Model</th>
                <th style={th}>Price</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedProducts.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #222" }}>
                  <td style={td}>
                    {p.image_url ? (
                      <img src={p.image_url} style={imgStyle} />
                    ) : "—"}
                  </td>

                  <td style={td} onClick={() => navigate(`/products/${p.id}`)}>
                    {p.productname}
                  </td>

                  <td style={td}>{p.brand}</td>
                  <td style={td}>{p.model}</td>
                  <td style={td}>€{p.price}</td>

                  <td style={td}>
                    <button style={btnStyle} onClick={() => { setEditingId(p.id); setEditProduct(p); }}>Edit</button>
                    <button style={btnStyle} onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT */}
      {editingId !== null && (
        <div style={editBox}>
          <h3>Edit Product</h3>

          <input style={inputStyle} value={editProduct?.productname || ""}
            onChange={(e) => setEditProduct({ ...editProduct, productname: e.target.value })}
          />

          <input style={inputStyle} value={editProduct?.brand || ""}
            onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
          />

          <input style={inputStyle} value={editProduct?.model || ""}
            onChange={(e) => setEditProduct({ ...editProduct, model: e.target.value })}
          />

          <input style={inputStyle} type="number" value={editProduct?.price || 0}
            onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
          />

          <button style={btnStyle} onClick={saveEdit}>Save</button>
          <button style={btnStyle} onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

/* STYLES */
const inputStyle = {
  padding: 6,
  background: "#111",
  color: "white",
  border: "1px solid #2a2a2a",
};

const btnStyle = {
  padding: "6px 10px",
  background: "#111",
  color: "white",
  border: "1px solid #2a2a2a",
  borderRadius: 4,
  cursor: "pointer",
  minWidth: 70,
  textAlign: "center",
};

const th = { textAlign: "left", padding: 10, opacity: 0.7 };
const td = {
  padding: 10,
  textAlign: "left",
  verticalAlign: "middle",
};
const imgStyle = { width: 50, height: 50, objectFit: "cover", borderRadius: 6 };
const editBox = {
  marginTop: 20,
  padding: 15,
  background: "#111",
  border: "1px solid #2a2a2a",
};