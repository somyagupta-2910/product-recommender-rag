// Recommendation System App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Auth and Language context providers
import { AuthProvider } from "./AuthContext";

// Page and Component Imports
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecommendationPage from "./pages/RecommendationPage";
import CartPage from "./pages/CartPage";
import AdminProductPage from "./pages/AdminProductPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DarkNavbar from "./components/DarkNavbar";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import OrdersPage from "./pages/OrdersPage";

// The AppContent component applies the language direction and renders the router and routes.
function AppContent() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
          <DarkNavbar />
          <main className="flex-grow">
            <Routes>
              {/* Common Routes */}
              <Route
                path="/login"
                element={<Login />}
              />
              <Route
                path="/signup"
                element={<Signup />}
              />
              <Route
                path="/"
                element={<RecommendationPage />}
              />
              <Route
                path="/cart"
                element={<CartPage />}
              />
              <Route
                path="/admin/products"
                element={<AdminProductPage />}
              />
              <Route
                path="/purchase-success"
                element={<PurchaseSuccessPage />}
              />
              <Route
                path="/orders"
                element={<OrdersPage />}
              />
            </Routes>
          </main>
        </div>
        <ToastContainer theme="dark" />
      </AuthProvider>
    </Router>
  );
}

// Wrap the AppContent with LanguageProvider so that languageDirection is available.
function App() {
  return (
    <AppContent />
  );
}

export default App;
