type EditingLine = {
    id: number;
    productname: string;
    amount: string;
    price: string;
};

type Props = {
    value: EditingLine;
    onChange: (v: EditingLine) => void;
    onSave: () => void;
    onCancel: () => void;
};

export default function InvoiceLineEditor({
    value,
    onChange,
    onSave,
    onCancel,
}: Props) {
    return (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
            <input
                value={value.productname}
                onChange={(e) =>
                    onChange({ ...value, productname: e.target.value })
                }
            />

            <input
                type="number"
                value={value.amount}
                onChange={(e) => {
                    console.log("AMOUNT CHANGE:", e.target.value);

                    onChange({
                        ...value,
                        amount: e.target.value,
                    });
                }}
            />

            <input
                type="number"
                value={value.price}
                onChange={(e) =>
                    onChange({ ...value, price: e.target.value })
                }
            />

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={onSave}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}