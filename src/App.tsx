import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
  useNavigate,
} from "react-router-dom";

import "./App.css";

import Customers from "./domains/customers/pages/CustomersPage";
import Products from "./domains/products/pages/ProductsPage";

import Storage from "./domains/storage/pages/StoragePage";
import StorageDetail from "./domains/storage/pages/StorageDetail";
import StorageCreate from "./domains/storage/pages/StorageCreate";
import Wholesale from "./domains/wholesale/pages/WholesalePage";
import WholesaleDetail from "./domains/wholesale/pages/WholesaleDetail";

import Dashboard from "./pages/Dashboard";

import Shop from "./pages/Shop";

import ProductDetail from "./domains/products/pages/ProductDetail";

import Login from "./pages/Login";

import AdminPanel from "./pages/AdminPanel";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import CustomerDetail from "./domains/customers/pages/CustomerDetail";

import InvoicesPage from "./modules/invoices/pages/InvoicesPage";
import InvoiceDetail from "./modules/invoices/pages/InvoiceDetail";

import { supabase } from "./services/supabase";
import CustomerCreate from "./domains/customers/pages/CustomerCreate";
 

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const linkStyle = (path: string) => ({
    color: location.pathname === path ? "#00ffcc" : "white",
    textDecoration: "none",
    padding: "6px 0",
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
    console.log("API KEY:", import.meta.env.VITE_API_KEY);
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px",
          background: "#111",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>RPA ERP</div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Link to="/" style={linkStyle("/")}>Dashboard</Link>
          <Link to="/customers" style={linkStyle("/customers")}>Customers</Link>
          <Link to="/products" style={linkStyle("/products")}>Products</Link>
          <Link to="/invoices" style={linkStyle("/invoices")}>Invoices</Link>
          <Link to="/storage" style={linkStyle("/storage")}>Storage</Link>
          <Link to="/wholesale" style={linkStyle("/wholesale")}>Wholesale</Link>
          <Link to="/shop" style={linkStyle("/shop")}>Shop</Link>
          <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <hr style={{ margin: "20px 0", borderColor: "#333" }} />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              background: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
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

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* LAYOUT */}
        <Route element={<Layout />}>
          
          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>

            <Route path="/" element={<Dashboard />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/new" element={<CustomerCreate />} />

            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />

            <Route path="/storage" element={<Storage />} />
            <Route path="/storage/:id" element={<StorageDetail />} />
            <Route path="/customers/new" element={<StorageCreate />} />

            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/wholesale/:id" element={<WholesaleDetail />} />

            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />

          </Route>

          {/* ADMIN */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}