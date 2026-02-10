import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, TruckIcon } from "lucide-react";
import { API_BASE_URL } from "../components/service/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vous devez être connecté");
      }

      const response = await fetch(`${API_BASE_URL}/api/myorder`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "IN_PROGRESS":
      case "en_cours":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "PENDING":
      case "pending":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "SHIPPED":
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case "DELIVERED":
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "CANCELLED":
      case "canceled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (statut) => {
    const statusMap = {
      IN_PROGRESS: "En cours",
      en_cours: "En cours",
      PENDING: "En attente",
      pending: "En attente",
      CONFIRMED: "Confirmée",
      SHIPPED: "Expédiée",
      DELIVERED: "Livrée",
      delivered: "Livrée",
      CANCELLED: "Annulée",
      canceled: "Annulée",
      RETURNED: "Retournée",
      returned: "Retournée",
    };
    return statusMap[statut] || statut;
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "IN_PROGRESS":
      case "en_cours":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "canceled":
        return "bg-red-100 text-red-800";
      case "RETURNED":
      case "returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de commandes.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 font-semibold"
          >
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // Parse items if they're a string
            const orderItems =
              typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items || [];

            return (
              <div
                key={order.id_order}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.statut)}
                        <h3 className="text-lg font-semibold text-gray-800">
                          Commande #{order.id_order}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          order.statut
                        )}`}
                      >
                        {getStatusLabel(order.statut)}
                      </span>
                      <p className="text-xl font-bold text-gray-800 mt-2">
                        {parseFloat(order.total_prix).toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {orderItems.length} article{orderItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/order/${order.id_order}`, { state: { order } })
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Voir les détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
