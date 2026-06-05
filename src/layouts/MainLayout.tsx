export default function MainLayout({ children }: any) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 220, background: "#eaeaea", padding: 10 }}>
        MENU
      </div>

      <div style={{ flex: 1, padding: 20 }}>
        {children}
      </div>
    </div>
  );
}