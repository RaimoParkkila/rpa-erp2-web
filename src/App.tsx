import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import "./App.css";

import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Invoices from "./pages/Invoices";
import Storage from "./pages/Storage";
import Wholesale from "./pages/Wholesale";
import Dashboard from "./pages/Dashboard";
import InvoicesJoined from "./pages/InvoicesJoined";
import ProductsJoined from "./pages/ProductsJoined";
import Shop from "./pages/Shop";
import InvoiceDetail from "./pages/InvoiceDetail";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import WholesaleDetail from "./pages/WholesaleDetail";
import AdminPanel from "./pages/AdminPanel";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

function Layout() {
  const location = useLocation();

  const linkStyle = (path: string) => ({
    color: location.pathname === path ? "#00ffcc" : "white",
    textDecoration: "none",
    padding: "6px 0",
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px",
          background: "#111",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>RPA ERP</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/" style={linkStyle("/")}>Dashboard</Link>
          <Link to="/customers" style={linkStyle("/customers")}>Customers</Link>
          <Link to="/products" style={linkStyle("/products")}>Products</Link>
          <Link to="/invoices" style={linkStyle("/invoices")}>Invoices</Link>
          <Link to="/storage" style={linkStyle("/storage")}>Storage</Link>
          <Link to="/wholesale" style={linkStyle("/wholesale")}>Wholesale</Link>
          <Link to="/shop" style={linkStyle("/shop")}>Shop</Link>
          <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN OUTSIDE LAYOUT */}
        <Route path="/login" element={<Login />} />

        {/* APP LAYOUT */}
        <Route element={<Layout />}>

          {/* USER PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/invoices-joined" element={<InvoicesJoined />} />
            <Route path="/products-joined" element={<ProductsJoined />} />
            <Route path="/shop" element={<Shop />} />

            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/wholesale/:id" element={<WholesaleDetail />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}