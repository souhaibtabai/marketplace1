import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const payment = location.state?.payment;

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">Aucune commande trouvée.</p>
          <button
            className="mt-4 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
            onClick={() => navigate("/products")}
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  // Parse items if they're a string
  const orderItems = typeof order.items === "string" 
    ? JSON.parse(order.items) 
    : order.items || [];

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: "Espèces à la livraison",
      CARD: "Carte bancaire",
      BANK_TRANSFER: "Virement bancaire",
      MOBILE_PAYMENT: "Paiement mobile",
    };
    return labels[method] || method;
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      PENDING: "En attente",
      COMPLETED: "Complété",
      FAILED: "Échoué",
      REFUNDED: "Remboursé",
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
          <p className="text-green-100">
            Votre commande a été enregistrée avec succès
          </p>
        </div>

        {/* Order Details */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Détails de la commande
            </h2>
            <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Numéro de commande</p>
                <p className="font-semibold text-gray-800">#{order.id_order}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="font-semibold text-blue-600">
                  {order.statut === "IN_PROGRESS" ? "En cours" : order.statut}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-gray-800 text-xl">
                  {parseFloat(order.total_prix).toFixed(2)}€
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(order.created_at || new Date()).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Articles</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {orderItems.map((item, index) => (
                    <li key={index} className="p-4 flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Produit #{item.id_produit}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.price}€ / unité
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Adresse de livraison
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {payment && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Informations de paiement
              </h2>
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Méthode de paiement</p>
                  <p className="font-semibold text-gray-800">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut du paiement</p>
                  <p className="font-semibold text-blue-600">
                    {getPaymentStatusLabel(payment.payment_status)}
                  </p>
                </div>
                {payment.transaction_id && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">ID de transaction</p>
                    <p className="font-mono text-sm text-gray-800">
                      {payment.transaction_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir mes commandes
            </button>
            <button
              onClick={() => navigate("/products")}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
