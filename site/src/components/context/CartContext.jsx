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
      loadCart();
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
      const response = await api.getCart();

      if (!response.ok) {
        setCart([]);
        setCartCount(0);
        return;
      }

      const data = await response.json();

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
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
