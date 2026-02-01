import React, { useState, useEffect } from "react";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderProducts, setOrderProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Get user data
  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!userData) return { role: null, token: null };
      const user = JSON.parse(userData);
      return {
        role: user.role || null,
        token: token || null,
        userId: user.id || user.id_utilisateur,
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
      return { role: null, token: null };
    }
  };

  const { role: userRole, token: userToken } = getUserData();

  const ORDER_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "en_cours",
    DELIVERED: "delivered",
    CANCELLED: "canceled",
    RETURNED: "returned",
  };

  const STATUS_LABELS = {
    pending: "Pending",
    en_cours: "In Progress",
    delivered: "Delivered",
    canceled: "Cancelled",
    returned: "Returned",
  };

  const STATUS_COLORS = {
    pending: "from-yellow-500 to-orange-500",
    en_cours: "from-blue-500 to-purple-500",
    delivered: "from-green-500 to-emerald-500",
    canceled: "from-red-500 to-pink-500",
    returned: "from-gray-500 to-slate-500",
  };

  const STATUS_BG_COLORS = {
    pending: "from-yellow-50 to-orange-50",
    en_cours: "from-blue-50 to-purple-50",
    delivered: "from-green-50 to-emerald-50",
    canceled: "from-red-50 to-pink-50",
    returned: "from-gray-50 to-slate-50",
  };

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      };

      // Build URL based on user role
      let url = "";
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (filters.status) params.append("statut", filters.status);

      // Try different endpoint paths
      if (userRole === "admin" || userRole === "ADMIN") {
        url = `/api/orders?${params}`;
      } else {
        // For vendor/livreur, also try to get all orders
        url = `/api/orders?${params}`;
      }

      console.log("📡 Fetching orders from:", url);
      console.log("👤 User role:", userRole);
      console.log("🔑 Has token:", !!userToken);

      const response = await fetch(url, { headers });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Orders data:", data);

      setOrders(data.orders || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order products
  const fetchOrderProducts = async (orderId) => {
    setLoadingProducts(true);
    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      };

      const response = await fetch(`/api/${orderId}/products`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setOrderProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching order products:", err);
      alert("Error loading order products: " + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedOrder) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      };

      const response = await fetch(`/api/${selectedOrder.id_order}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ statut: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      alert("Status updated successfully!");
      setShowStatusModal(false);
      fetchOrders(pagination.currentPage);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status: " + err.message);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      };

      const response = await fetch(`/api/${orderId}/cancel`, {
        method: "PATCH",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully!");
      fetchOrders(pagination.currentPage);
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Error cancelling order: " + err.message);
    }
  };

  // View order details
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    await fetchOrderProducts(order.id_order);
    setShowDetailsModal(true);
  };

  // Open status modal
  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.statut);
    setShowStatusModal(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    fetchOrders(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", search: "" });
    fetchOrders(1);
  };

  // Filter orders by search (client side for non-admin)
  const filteredOrders = orders.filter((order) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      order.id_order?.toString().includes(searchLower) ||
      order.username?.toLowerCase().includes(searchLower) ||
      order.email?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.statut === ORDER_STATUS.PENDING).length,
    inProgress: orders.filter((o) => o.statut === ORDER_STATUS.IN_PROGRESS)
      .length,
    delivered: orders.filter((o) => o.statut === ORDER_STATUS.DELIVERED).length,
    cancelled: orders.filter((o) => o.statut === ORDER_STATUS.CANCELLED).length,
    totalRevenue: orders
      .filter((o) => o.statut === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + parseFloat(o.total_prix || 0), 0),
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage customer orders and track status
            </p>
          </div>
        </div>

        {/* Statistics Cards - Admin Only */}
        {(userRole === "admin" || userRole === "ADMIN") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.total}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    Delivered
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.delivered}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    Revenue
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.totalRevenue.toFixed(2)} DT
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl p-6 rounded-3xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Search by order ID, customer..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg placeholder-gray-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="en_cours">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                disabled={loading}
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-500">📦</span>
              </div>
              <p className="text-xl text-gray-500 font-medium">
                No orders found.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id_order}
                className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.id_order}
                        </h3>
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                            STATUS_COLORS[order.statut]
                          } shadow-lg`}
                        >
                          {STATUS_LABELS[order.statut]}
                        </span>
                      </div>

                      {order.username && (
                        <p className="text-gray-600 text-sm mb-1">
                          <span className="font-semibold">Customer:</span>{" "}
                          {order.username}
                        </p>
                      )}
                      {order.email && (
                        <p className="text-gray-600 text-sm mb-1">
                          <span className="font-semibold">Email:</span>{" "}
                          {order.email}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {parseFloat(order.total_prix || 0).toFixed(2)} DT
                      </p>
                    </div>
                  </div>

                  {order.shipping_address && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Shipping:</span>{" "}
                        {order.shipping_address}
                      </p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Notes:</span>{" "}
                        {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Details
                    </button>

                    {(userRole === "admin" ||
                      userRole === "ADMIN" ||
                      userRole === "VENDOR") && (
                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Change Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Admin Only */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => fetchOrders(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-6 py-2 bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl font-semibold text-gray-700 shadow-lg">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => fetchOrders(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage === pagination.totalPages || loading
              }
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 w-full max-w-3xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Order Details #{selectedOrder.id_order}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setOrderProducts([]);
                }}
                className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div
                className={`bg-gradient-to-r ${
                  STATUS_BG_COLORS[selectedOrder.statut]
                } rounded-2xl p-6 border border-gray-200`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${
                        STATUS_COLORS[selectedOrder.statut]
                      } shadow-lg`}
                    >
                      {STATUS_LABELS[selectedOrder.statut]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {parseFloat(selectedOrder.total_prix || 0).toFixed(2)} DT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">
                      Order Date
                    </p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedOrder.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  {selectedOrder.finished_statut_at && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold mb-1">
                        Completed Date
                      </p>
                      <p className="text-gray-900 font-medium">
                        {new Date(
                          selectedOrder.finished_statut_at
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {selectedOrder.username && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      Customer Information
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.username}
                    </p>
                    {selectedOrder.email && (
                      <p className="text-gray-900">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedOrder.email}
                      </p>
                    )}
                  </div>
                )}

                {selectedOrder.shipping_address && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      Shipping Address
                    </p>
                    <p className="text-gray-900">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      Notes
                    </p>
                    <p className="text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Products */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Order Items
                </h3>

                {loadingProducts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : orderProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No products found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orderProducts.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">
                              {item.product?.name || "Product"}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.product?.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-700">
                                <span className="font-semibold">Price:</span>{" "}
                                {parseFloat(item.price || 0).toFixed(2)} DT
                              </span>
                              <span className="text-gray-700">
                                <span className="font-semibold">Quantity:</span>{" "}
                                {item.quantity}
                              </span>
                              <span className="font-bold text-green-600">
                                Subtotal:{" "}
                                {(
                                  parseFloat(item.price || 0) * item.quantity
                                ).toFixed(2)}{" "}
                                DT
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Order Total:
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {parseFloat(selectedOrder.total_prix || 0).toFixed(2)}{" "}
                          DT
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setOrderProducts([]);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Change Order Status
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Order #{selectedOrder.id_order}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Current Status:{" "}
                  <span className="font-bold">
                    {STATUS_LABELS[selectedOrder.statut]}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="en_cours">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="canceled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> Changing status
                  to Delivered, Cancelled, or Returned will mark the order as
                  completed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === selectedOrder.statut}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
