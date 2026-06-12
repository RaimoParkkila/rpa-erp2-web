import React from "react";

type Props = {
  status: string;
};

export function StatusChip({ status }: Props) {
  const normalized = status?.toLowerCase();

  const baseStyle: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
    minWidth: 70,
    textAlign: "center",
    border: "1px solid #333",
    letterSpacing: "0.3px",
  };

  let color = "#aaa";
  let bg = "#111";

  switch (normalized) {
    case "paid":
      color = "#4ade80";
      bg = "#0f1a12";
      break;

    case "pending":
    case "draft":
      color = "#facc15";
      bg = "#1a1605";
      break;

    case "overdue":
      color = "#f87171";
      bg = "#1a0f0f";
      break;

    default:
      color = "#cbd5e1";
      bg = "#111";
      break;
  }

  return (
    <span style={{ ...baseStyle, color, background: bg }}>
      {status?.toUpperCase()}
    </span>
  );
}