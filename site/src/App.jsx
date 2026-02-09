import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext.jsx";
import { CartProvider } from "./components/context/CartContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer";
import ProductsPage from "./Page/ProductPage";
import HomePage from "./Page/HomePage.jsx";
import LoginPage from "./Page/loginPage";
import RegisterPage from "./Page/RegisterPage.jsx";
import BusinessAccountRequest from "./Page/BusinessAccount.jsx";
import ShopPage from "./Page/ShopPage.jsx";
import ShopDetailPage from "./Page/ShopDetailPage.jsx";
import CartPage from "./Page/CartPage";
import CheckoutPage from "./Page/CheckoutPage";
import OrderConfirmationPage from "./Page/OrderConfirmationPage";
import OrdersPage from "./Page/OrdersPage";
import PrivateRoute from "./components/PrivateRoute.jsx";
import "./App.css";

// Layout wrapper for client routes
const LayoutWrapper = ({ children }) => (
  <PrivateRoute allowedRoles={["client"]}>
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  </PrivateRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/business-account"
                element={<BusinessAccountRequest />}
              />

              {/* Protected client routes with layout */}
              <Route
                path="/"
                element={
                  <LayoutWrapper>
                    <Navigate to="/home" replace />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/home"
                element={
                  <LayoutWrapper>
                    <HomePage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/shops"
                element={
                  <LayoutWrapper>
                    <ShopPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/products"
                element={
                  <LayoutWrapper>
                    <ProductsPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/shop/:id"
                element={
                  <LayoutWrapper>
                    <ShopDetailPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/cart"
                element={
                  <LayoutWrapper>
                    <CartPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/checkout"
                element={
                  <LayoutWrapper>
                    <CheckoutPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/order-confirmation"
                element={
                  <LayoutWrapper>
                    <OrderConfirmationPage />
                  </LayoutWrapper>
                }
              />
              <Route
                path="/orders"
                element={
                  <LayoutWrapper>
                    <OrdersPage />
                  </LayoutWrapper>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
