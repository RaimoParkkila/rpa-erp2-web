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

  const [brandFilter, setBrandFilter] = useState<string>("ALL");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [sort, setSort] = useState<string>("NONE");

  const removeBrandFilter = () => setBrandFilter("ALL");
  const removeMinPrice = () => setMinPrice("");
  const removeMaxPrice = () => setMaxPrice("");
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

    const { error } = await supabase
      .from("rpa_shop_product")
      .insert({
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function deleteProduct(id: number) {
    const { error } = await supabase
      .from("rpa_shop_product")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rpa_shop_product")
      .select("id, productname, brand, model, price, status, image_url");

    if (error) {
      console.error("FETCH ERROR:", error);
    } else {
      setProducts((data as Product[]) || []);
    }

    setLoading(false);
  }

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  // 🔥 FILTER
  const filteredProducts = products.filter((p) => {
    const matchesBrand =
      brandFilter === "ALL" || p.brand === brandFilter;

    const matchesMin =
      minPrice === "" || p.price >= Number(minPrice);

    const matchesMax =
      maxPrice === "" || p.price <= Number(maxPrice);

    const matchesSearch =
      search === "" ||
      p.productname.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase());

    return (
      matchesBrand &&
      matchesMin &&
      matchesMax &&
      matchesSearch
    );
  });
  // 🔥 SORT
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
    <div>
      <h1>Products</h1>


      <div style={{
        marginBottom: 20,
        padding: 10,
        border: "1px solid #333",
        borderRadius: 8,
        background: "#111",
      }}>
        <h3>Add Product</h3>

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
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: Number(e.target.value) })
          }
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) setImageFile(e.target.files[0]);
          }}
        />

        <button onClick={addProduct}>
          Add Product
        </button>
      </div>
      {/* FILTER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        {/* BRAND FILTER */}
        {/* BRAND FILTER */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#1e1e1e",
              color: "white",
              minWidth: "220px",
            }}
          />

          <button
            onClick={() => setBrandFilter("ALL")}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #333",
              background: brandFilter === "ALL" ? "#00ffcc" : "#1e1e1e",
              color: brandFilter === "ALL" ? "#000" : "#fff",
              cursor: "pointer",
            }}
          >
            ALL
          </button>

          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid #333",
                background: brandFilter === b ? "#00ffcc" : "#1e1e1e",
                color: brandFilter === b ? "#000" : "#fff",
                cursor: "pointer",
              }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* PRICE + SORT */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#1e1e1e",
              color: "white",
              width: "120px",
            }}
          />

          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#1e1e1e",
              color: "white",
              width: "120px",
            }}
          />

          {/* SORT DROPDOWN */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#1e1e1e",
              color: "white",
            }}
          >
            <option value="NONE">Sort</option>
            <option value="PRICE_ASC">Price ↑</option>
            <option value="PRICE_DESC">Price ↓</option>
            <option value="NAME_AZ">Name A-Z</option>
            <option value="NAME_ZA">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* ACTIVE CHIPS */}
      {(brandFilter !== "ALL" || minPrice !== "" || maxPrice !== "") && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          {brandFilter !== "ALL" && (
            <div onClick={removeBrandFilter} style={{
              padding: "6px 12px",
              borderRadius: "999px",
              background: "#00ffcc",
              color: "#000",
              cursor: "pointer",
              fontSize: "12px",
            }}>
              Brand: {brandFilter} ✕
            </div>
          )}

          {minPrice !== "" && (
            <div onClick={removeMinPrice} style={{
              padding: "6px 12px",
              borderRadius: "999px",
              background: "#1e3a5f",
              color: "#4da3ff",
              cursor: "pointer",
              fontSize: "12px",
            }}>
              Min: €{minPrice} ✕
            </div>
          )}

          {maxPrice !== "" && (
            <div onClick={removeMaxPrice} style={{
              padding: "6px 12px",
              borderRadius: "999px",
              background: "#1f3d2b",
              color: "#3dff9a",
              cursor: "pointer",
              fontSize: "12px",
            }}>
              Max: €{maxPrice} ✕
            </div>
          )}
        </div>
      )}
      
      {/* TABLE */}
      {loading && <p>Loading...</p>}

      {!loading && (
        <table border={1} cellPadding={8} style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>

            </tr>
          </thead>

          <tbody>
            {sortedProducts.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.productname}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </td>

                <td>{p.productname}</td>
                <td>{p.brand}</td>
                <td>{p.model}</td>
                <td>€{p.price}</td>
                <td>{p.status || "—"}</td>
             
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>

                    {/* EDIT */}
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setEditProduct(p);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#1e1e1e",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => deleteProduct(p.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#2a1e1e",
                        color: "#ff4d4d",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}