import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrud } from "../../../hooks/useCrud";

type CustomerForm = {
    firstname: string;
    email: string;
    city: string;
    country: string;
    phone1: string;
};

export default function CustomerCreate() {
    const navigate = useNavigate();

    const { create } = useCrud({
        domain: "customers",
        enableTenant: false
    });

    const [form, setForm] = useState<CustomerForm>({
        firstname: "",
        email: "",
        city: "",
        country: "",
        phone1: "",
    });

    function updateField(field: keyof CustomerForm, value: string) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    async function handleSave() {
        console.log("SAVE CLICKED", form);

        const result = await create(form);

        console.log("CREATE RESULT:", result);

        if (result) {
            navigate("/customers");
        }
    }
    return (
        <div style={{ padding: 20, color: "white", maxWidth: 600 }}>
            <h1>Create Customer</h1>

            <div style={{ display: "grid", gap: 10 }}>
                <input
                    placeholder="Firstname"
                    value={form.firstname}
                    onChange={(e) => updateField("firstname", e.target.value)}
                />

                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                />

                <input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                />

                <input
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                />

                <input
                    placeholder="Phone"
                    value={form.phone1}
                    onChange={(e) => updateField("phone1", e.target.value)}
                />

                <button
                    onClick={handleSave}
                    style={{
                        padding: 10,
                        background: "#00ffcc",
                        color: "#000",
                        cursor: "pointer",
                    }}
                >
                    Save Customer
                </button>

                <button
                    onClick={() => navigate("/customers")}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}