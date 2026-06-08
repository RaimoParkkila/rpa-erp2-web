import { useEffect, useState } from "react";

import { supabase } from "@services/supabase";
import { useNavigate } from "react-router-dom";

type Product = {
    id: number;
    productname: string;
    brand: string;
    model: string;
    price: number;
    image_url?: string;
};

type CartItem = {
    id: number;
    productname: string;
    price: number;
    quantity: number;
};

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [cart, setCart] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

    const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [undoItem, setUndoItem] = useState<CartItem | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const navigate = useNavigate();

    // ---------------- FETCH ----------------

    async function fetchProducts() {
        const { data, error } = await supabase
            .from("rpa_shop_product")
            .select("*");

        if (error) console.error(error);
        else setProducts((data as Product[]) || []);

        setLoading(false);
    }

    async function fetchCustomers() {
        const { data, error } = await supabase
            .from("rpa_customer")
            .select("id, firstname");

        if (error) console.error(error);
        else setCustomers(data || []);
    }

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    // ---------------- CART ----------------

    function syncCart(updated: CartItem[]) {
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
    }

    function addToCart(product: Product) {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);

            const updated = existing
                ? prev.map(p =>
                    p.id === product.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                )
                : [
                    ...prev,
                    {
                        id: product.id,
                        productname: product.productname,
                        price: product.price,
                        quantity: 1,
                    },
                ];

            syncCart(updated);
            return updated;
        });
    }

    function removeOne(productId: number) {
        setCart(prev => {
            const updated = prev
                .map(p =>
                    p.id === productId
                        ? { ...p, quantity: p.quantity - 1 }
                        : p
                )
                .filter(p => p.quantity > 0);

            syncCart(updated);
            return updated;
        });
    }

    function removeAll(productId: number) {
        setCart(prev => {
            const removed = prev.find(p => p.id === productId);
            const updated = prev.filter(p => p.id !== productId);

            if (removed) {
                setUndoItem(removed);
                setToast("Removed from cart");

                setTimeout(() => {
                    setUndoItem(null);
                    setToast(null);
                }, 5000);
            }

            syncCart(updated);
            return updated;
        });
    }

    function undoRemove() {
        if (!undoItem) return;

        setCart(prev => {
            const updated = [...prev, undoItem];
            syncCart(updated);
            return updated;
        });

        setUndoItem(null);
        setToast(null);
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    // ---------------- INVOICE ----------------

    async function createInvoice() {
        if (!selectedCustomer) return;

        const { data: invoice, error } = await supabase
            .from("rpaheaderofinvoice")
            .insert({
                status: "DRAFT",
                rpa_customer_id: selectedCustomer,
            })
            .select()
            .single();

        if (error || !invoice) return;

        const lines = cart.map(item => ({
            productname: item.productname,
            price: item.price,
            amount: item.quantity,
            rpa_shop_product_id: item.id,
            rpa_headerofinvoice_id: invoice.id,
        }));

        await supabase.from("rpa_invoice_line").insert(lines);

        syncCart([]);
        setCreatedInvoiceId(invoice.id);
        setShowSuccess(true);
    }

    // ---------------- UI ----------------

    if (showSuccess && createdInvoiceId) {
        return (
            <div style={{ padding: 40 }}>
                <h1>Invoice Created</h1>
                <h2>#{createdInvoiceId}</h2>

                <a href={`/invoices/${createdInvoiceId}`}>
                    Open invoice
                </a>

                <button onClick={() => setShowSuccess(false)}>
                    Back
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: "20px",
                padding: "20px",
                alignItems: "start",
            }}
        >

            {/* LEFT PRODUCTS */}
            <div style={{ flex: 3 }}>
                <div
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                >
                    <h1 style={{ margin: 0, lineHeight: 1.2 }}>
                        Shop
                    </h1>

                    <div style={{ opacity: 0.6, fontSize: 12 }}>
                        Browse products & build your cart
                    </div>
                </div>

                {loading && <p>Loading...</p>}

                {!loading && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 12,
                    }}>
                        {products.map(p => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`/shop/${p.id}`)}
                                style={{
                                    background: "#1e1e1e",
                                    color: "white",
                                    padding: 12,
                                    borderRadius: 8,
                                    border: "1px solid #333",
                                    cursor: "pointer",
                                }}
                            >
                                {p.image_url && (
                                    <img
                                        src={p.image_url}
                                        style={{
                                            width: "100%",
                                            height: 140,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                        }}
                                    />
                                )}

                                <h3>{p.productname}</h3>
                                <div>{p.brand}</div>
                                <div>{p.price} €</div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(p);
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CART */}
            <div style={{
                flex: 1,
                background: "#111",
                color: "white",
                padding: 12,
                borderRadius: 8,
                position: "sticky",
                top: 20
            }}>
                <h2>Cart</h2>

                <select
                    value={selectedCustomer ?? ""}
                    onChange={(e) =>
                        setSelectedCustomer(e.target.value ? Number(e.target.value) : null)
                    }
                >
                    <option value="">-- customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.firstname}
                        </option>
                    ))}
                </select>

                {cart.map(item => (
                    <div
                        key={item.id}
                        style={{
                            marginBottom: 10,
                            padding: 10,
                            borderRadius: 10,
                            border: "1px solid #222",
                            background: "#1a1a1a",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {/* LEFT INFO */}
                        <div>
                            <div style={{ fontWeight: 600 }}>
                                {item.productname}
                            </div>

                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                                €{item.price} × {item.quantity}
                            </div>
                        </div>

                        {/* RIGHT CONTROLS */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 8px",
                                borderRadius: 10,
                                border: "1px solid #2a2a2a",
                                background: "#111",
                            }}
                        >
                            {/* MINUS */}
                            <button
                                onClick={() => removeOne(item.id)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    border: "1px solid #333",
                                    background: "#1e1e1e",
                                    color: "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                −
                            </button>

                            {/* QUANTITY */}
                            <span
                                style={{
                                    minWidth: 24,
                                    textAlign: "center",
                                    fontWeight: 600,
                                }}
                            >
                                {item.quantity}
                            </span>

                            {/* PLUS */}
                            <button
                                onClick={() => {
                                    const p = products.find(x => x.id === item.id);
                                    if (p) addToCart(p);
                                }}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    border: "1px solid #333",
                                    background: "#00ffcc",
                                    color: "#000",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                +
                            </button>
                        </div>

                        {/* DELETE */}
                        <button
                            onClick={() => removeAll(item.id)}
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                border: "1px solid #333",
                                background: "#2a1e1e",
                                color: "#ff4d4d",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            🗑
                        </button>
                    </div>
                ))}

                <h3>Total: {total} €</h3>

                <button onClick={() => syncCart([])}>
                    Clear
                </button>

                <button
                    disabled={!selectedCustomer || cart.length === 0}
                    onClick={createInvoice}
                >
                    Create Invoice
                </button>
            </div>

            {/* TOAST */}
            {toast && (
                <div style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#222",
                    padding: 10,
                    borderRadius: 8,
                }}>
                    {toast}
                    <button onClick={undoRemove}>Undo</button>
                </div>
            )}
        </div>
    );
}