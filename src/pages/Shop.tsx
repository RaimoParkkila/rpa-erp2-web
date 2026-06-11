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

    // ---------------- TOTAL ----------------

    const total = cart.reduce(
        (s, i) => s + Number(i.price) * Number(i.quantity),
        0
    );

    // ---------------- CREATE INVOICE ----------------

    async function createInvoice() {
        if (!selectedCustomer || cart.length === 0) {
            console.warn("CREATE CANCELLED");
            return;
        }

        console.log("🧾 CART:", cart);

        // 1. CREATE HEADER
        const { data: invoice, error } = await supabase
            .from("rpaheaderofinvoice")
            .insert({
                status: "DRAFT",
                rpa_customer_id: selectedCustomer,
            })
            .select()
            .single();

        if (error || !invoice) {
            console.error("CREATE ERROR:", error);
            return;
        }

        console.log("✅ INVOICE:", invoice);

        // 2. LINES (SNAPSHOT FORMAT)
        const lines = cart.map(item => ({
            productname_snapshot: item.productname,
            price_snapshot: Number(item.price),
            amount_snapshot: Number(item.quantity),
            rpa_shop_product_id: item.id,
            rpa_headerofinvoice_id: invoice.id,
        }));

        // 3. TOTAL CALC
        const subtotal = lines.reduce(
            (s, l) => s + l.price_snapshot * l.amount_snapshot,
            0
        );

        const tax = subtotal * 0.21;
        const total = subtotal + tax;

        console.log("💰 DEBUG TOTAL:", total);

        // 4. INSERT LINES
        const { error: lineError } = await supabase
            .from("rpa_invoice_line")
            .insert(lines);

        if (lineError) {
            console.error("LINE ERROR:", lineError);
            return;
        }

        console.log("✅ LINES OK");

        // 5. 🔥 CRITICAL FIX: UPDATE HEADER TOTALS
        const { error: updateError } = await supabase
            .from("rpaheaderofinvoice")
            .update({
                subtotal,
                tax,
                total,
                snapshot: {
                    lines,
                    totals: {
                        subtotal,
                        tax,
                        total,
                    }
                }
            })
            .eq("id", invoice.id);

        if (updateError) {
            console.error("UPDATE HEADER ERROR:", updateError);
            return;
        }

        console.log("✅ HEADER UPDATED");

        // 6. RESET UI
        syncCart([]);
        setCreatedInvoiceId(invoice.id);
        setShowSuccess(true);
    }
    // ---------------- SUCCESS SCREEN ----------------

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

    // ---------------- UI ----------------

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 20,
            padding: 20
        }}>

            {/* PRODUCTS */}
            <div>
                {loading && <p>Loading...</p>}

                {products.map(p => (
                    <div key={p.id} style={{
                        background: "#1e1e1e",
                        color: "white",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 10
                    }}>
                        {p.image_url && (
                            <img
                                src={p.image_url}
                                style={{
                                    width: "100%",
                                    height: 140,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginBottom: 8
                                }}
                            />
                        )}

                        <h3>{p.productname}</h3>
                        <div>{p.brand}</div>
                        <div>{p.price} €</div>

                        <button onClick={() => addToCart(p)}>
                            Add to cart
                        </button>
                    </div>
                ))}
            </div>

            {/* CART */}
            {/* CART */}
            <div>
                <h2>Cart</h2>

                <select
                    value={selectedCustomer ?? ""}
                    onChange={(e) =>
                        setSelectedCustomer(
                            e.target.value ? Number(e.target.value) : null
                        )
                    }
                    style={{ width: "100%", marginBottom: 10 }}
                >
                    <option value="">-- customer --</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.firstname}
                        </option>
                    ))}
                </select>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 10,
                                background: "#1a1a1a",
                                borderRadius: 8,
                            }}
                        >
                            {/* NAME */}
                            <div style={{ flex: 1 }}>{item.productname}</div>

                            {/* QTY CONTROLS */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <button onClick={() => removeOne(item.id)}>-</button>

                                <span style={{ minWidth: 20, textAlign: "center" }}>
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        addToCart(products.find((p) => p.id === item.id)!)
                                    }
                                >
                                    +
                                </button>
                            </div>

                            {/* PRICE */}
                            <div style={{ width: 80, textAlign: "right" }}>
                                {(item.price * item.quantity).toFixed(2)} €
                            </div>
                        </div>
                    ))}
                </div>

                {/* TOTAL BOX */}
                <div
                    style={{
                        marginTop: 15,
                        padding: 12,
                        background: "#111",
                        border: "1px solid #333",
                        borderRadius: 8,
                    }}
                >
                    <strong>Total: {total.toFixed(2)} €</strong>
                </div>

                <button
                    style={{ marginTop: 10, width: "100%" }}
                    disabled={!selectedCustomer || cart.length === 0}
                    onClick={createInvoice}
                >
                    Create Invoice
                </button>
            </div>
        </div>
    );
}