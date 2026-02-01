import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../service/api";

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Temporarily disable auto-loading cart due to backend auth issue
      // loadCart();
      console.log("Cart loading disabled due to backend authentication issue");
      console.log(
        "Fix: Backend needs req.user.id_utilisateur but token provides req.user.id"
      );
    } else {
      // Clear cart when not authenticated
      setCart([]);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      console.log("Loading cart...");

      // Debug: Check token payload
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", payload);
            console.log("User ID from token:", payload.id);
            console.log("User ID type:", typeof payload.id);
          }
        } catch (e) {
          console.error("Could not parse token:", e);
        }
      }

      const response = await api.getCart();

      if (!response.ok) {
        console.error(
          "Cart API response not ok:",
          response.status,
          response.statusText
        );

        // Try to get error details from response
        try {
          const errorData = await response.text(); // Use text() first, then try JSON
          console.error("Backend error details:", errorData);

          // Try to parse as JSON if possible
          try {
            const jsonError = JSON.parse(errorData);
            console.error("Parsed error:", jsonError);

            // Check if it's the specific SQL error
            if (
              jsonError.message &&
              jsonError.message.includes("syntaxe en entrée invalide")
            ) {
              console.error(
                "🚨 SQL SYNTAX ERROR: The backend is trying to use a string where it expects an integer"
              );
              console.error(
                "This usually means req.user.id_utilisateur is undefined or has wrong value"
              );
              console.error(
                "Check your authentication middleware and make sure it sets req.user properly"
              );
            }
          } catch (e) {
            console.error("Error response is not JSON:", errorData);
          }
        } catch (e) {
          console.error("Could not read error response");
        }

        // Set empty cart on error
        setCart([]);
        setCartCount(0);
        return;
      }

      const data = await response.json();
      console.log("Cart data received:", data);

      setCart(data.items || []);
      setCartCount(data.itemCount || data.items?.length || 0);
    } catch (error) {
      console.error("Error loading cart:", error);
      // Set empty cart on error to prevent infinite loading states
      setCart([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (id_produit, quantity = 1) => {
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Vous devez être connecté pour ajouter au panier",
      };
    }

    try {
      const response = await api.addToCart(id_produit, quantity);
      const data = await response.json();
      if (response.ok) {
        await loadCart();
        return { success: true, message: data.message || "Ajouté au panier" };
      }
      return {
        success: false,
        message: data.message || "Erreur lors de l'ajout au panier",
      };
    } catch (error) {
      console.error("Error adding to cart:", error);
      return { success: false, message: "Erreur lors de l'ajout au panier" };
    }
  };

  const removeFromCart = async (id_cart) => {
    if (!isAuthenticated) {
      return { success: false, message: "Vous devez être connecté" };
    }

    try {
      const response = await api.removeFromCart(id_cart);
      const data = await response.json();
      if (response.ok) {
        await loadCart();
        return {
          success: true,
          message: data.message || "Produit supprimé du panier",
        };
      }
      return {
        success: false,
        message: data.message || "Erreur lors de la suppression",
      };
    } catch (error) {
      console.error("Error removing from cart:", error);
      return { success: false, message: "Erreur lors de la suppression" };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false, message: "Vous devez être connecté" };
    }

    try {
      const response = await api.clearCart();
      const data = await response.json();
      if (response.ok) {
        await loadCart();
        return { success: true, message: data.message || "Panier vidé" };
      }
      return {
        success: false,
        message: data.message || "Erreur lors du vidage du panier",
      };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, message: "Erreur lors du vidage du panier" };
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    loadCart, // Keep this for manual testing
    // Add manual load function
    manualLoadCart: () => {
      console.log("Manually loading cart...");
      loadCart();
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
