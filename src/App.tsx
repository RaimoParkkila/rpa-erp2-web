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
import Invoices from "./pages/Invoices_poista";
import Storage from "./pages/Storage";
import Wholesale from "./pages/Wholesale";
import Dashboard from "./pages/Dashboard";
import InvoicesJoined from "./pages/InvoicesJoined_poista";
import ProductsJoined from "./pages/ProductsJoined";
import Shop from "./pages/Shop";
//import InvoiceDetail from "./pages/InvoiceDetail";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import WholesaleDetail from "./pages/WholesaleDetail";
import AdminPanel from "./pages/AdminPanel";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

//mport MainLayout from "./layouts/MainLayout";

import CustomerDetail from "./pages/CustomerDetail";
import StorageDetail from "./pages/StorageDetail";


import InvoicesPage from "./modules/invoices/pages/InvoicesPage";
import InvoiceDetail from "./modules/invoices/pages/InvoiceDetail";
import { useNavigate } from "react-router-dom";
import { supabase } from "./services/supabase";





//uudet importit


function Layout() {
  const location = useLocation();

  const linkStyle = (path: string) => ({
    color: location.pathname === path ? "#00ffcc" : "white",
    textDecoration: "none",
    padding: "6px 0",
  });


  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
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
          height: "100vh",
        }}
        
      >
        RPA ERP

        {/* NAV */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <Link to="/" style={linkStyle("/")}>Dashboard</Link>
          <Link to="/customers" style={linkStyle("/customers")}>Customers</Link>
          <Link to="/products" style={linkStyle("/products")}>Products</Link>
          <Link to="/invoices" style={linkStyle("/invoices")}>Invoices</Link>
          <Link to="/storage" style={linkStyle("/storage")}>Storage</Link>
          <Link to="/wholesale" style={linkStyle("/wholesale")}>Wholesale</Link>
          <Link to="/shop" style={linkStyle("/shop")}>Shop</Link>
          <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
        </nav>

        {/* 🔥 TÄMÄ ON LOGOUT BLOKKI */}
        <div style={{ marginTop: "auto" }}>
          <hr style={{ margin: "20px 0", borderColor: "#333" }} />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
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

          {/* PROTECTED AREA */}
          <Route element={<ProtectedRoute />}>

            {/* USER ROUTES */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />

            <Route path="/products" element={<Products />} />

            {/* Invoices */}
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />

            {/* STORAGE */}
            <Route path="/storage" element={<Storage />} />
            <Route path="/storage/:id" element={<StorageDetail />} />

            {/* WHOLESALE */}
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/wholesale/:id" element={<WholesaleDetail />} />

            {/* JOINED / EXTRA */}
            <Route path="/invoices-joined" element={<InvoicesJoined />} />
            <Route path="/products-joined" element={<ProductsJoined />} />

            {/* SHOP */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />

            {/* PRODUCTS DETAIL */}
            <Route path="/products/:id" element={<ProductDetail />} />

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