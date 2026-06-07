import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../services/supabase";
import { useNavigate } from "react-router-dom";

type Product = {
    id: number;
    productname: string;
    brand: string;
    model: string;
    price: number;
    image_url?: string;
};


export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, []);


    function addToCart(product: Product) {
        const existing = localStorage.getItem("cart");
        const cart = existing ? JSON.parse(existing) : [];

        cart.push({
            id: product.id,
            productname: product.productname,
            price: product.price,
        });

        localStorage.setItem("cart", JSON.stringify(cart));
    }

    async function fetchProduct() {
        setLoading(true);

        const { data, error } = await supabase
            .from("rpa_shop_product")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error(error);
        } else {
            setProduct(data);
        }

        setLoading(false);
    }

    if (loading) return <p>Loading...</p>;
    if (!product) return <p>Not found</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>

            {/* NAV */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "20px",
                    padding: "10px",
                    borderBottom: "1px solid #333",
                }}
            >
                <button
                    onClick={() => navigate("/products")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#1e1e1e",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    ← Products
                </button>

                <button
                    onClick={() => navigate("/shop")}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#1e1e1e",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    ← Shop
                </button>
            </div>

            {/* PRODUCT CARD */}
            <div
                style={{
                    background: "#1e1e1e",
                    padding: "20px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    textAlign: "center",
                }}
            >
                <h1>{product.productname}</h1>

                {product.image_url && (
                    <img
                        src={product.image_url}
                        style={{
                            width: "300px",
                            borderRadius: "10px",
                            marginBottom: "10px",
                        }}
                    />
                )}

                <p><b>Brand:</b> {product.brand}</p>
                <p><b>Model:</b> {product.model}</p>
                <p><b>Price:</b> €{product.price}</p>
                <button
                    onClick={() => addToCart(product)}
                    style={{
                        marginTop: "15px",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        border: "1px solid #333",
                        background: "#00ffcc",
                        color: "#000",
                        cursor: "pointer",
                    }}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}