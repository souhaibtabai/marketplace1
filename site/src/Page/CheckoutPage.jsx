import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../components/context/CartContext.jsx";
import { API_BASE_URL } from "../components/service/api";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vous devez être connecté pour commander");
      }

      // Prepare order items
      const items = cart.map((item) => ({
        id_produit: item.id_produit || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Step 1: Create the order
      const orderResponse = await fetch(`${API_BASE_URL}/api/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
          notes,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Erreur lors de la création de la commande");
      }

      // Step 2: Create the payment
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_order: orderData.order.id_order,
          payment_method: paymentMethod,
          notes: `Payment for order #${orderData.order.id_order}`,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Erreur lors de la création du paiement");
      }

      // Clear cart after successful order
      clearCart();

      // Navigate to order confirmation
      navigate("/order-confirmation", { 
        state: { 
          order: orderData.order,
          payment: paymentData.payment 
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">Votre panier est vide.</p>
          <button
            className="mt-4 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
            onClick={() => navigate("/products")}
          >
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Finaliser la commande</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Résumé de la commande
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <ul className="divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id || item.id_produit} className="p-4 flex justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(item.price * item.quantity).toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">{item.price}€ / unité</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalPrice.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Informations de livraison
          </h3>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label
                htmlFor="shipping_address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse de livraison
              </label>
              <textarea
                id="shipping_address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                required
                placeholder="Entrez votre adresse complète"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Instructions de livraison, commentaires..."
              />
            </div>

            <div>
              <label
                htmlFor="payment_method"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mode de paiement
              </label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="CASH">Espèces à la livraison</option>
                <option value="CARD">Carte bancaire</option>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="MOBILE_PAYMENT">Paiement mobile</option>
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Traitement..." : "Confirmer la commande"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retour au panier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
