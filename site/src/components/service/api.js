// API Service
export const api = {
  baseURL: "/api",

  // Helper method for consistent headers
  getHeaders() {
    const token = localStorage.getItem("token"); // or however you store it
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  },

  // Products endpoints
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${api.baseURL}/produit?${queryString}`
      : `${api.baseURL}/produit`;
    return fetch(url, {
      method: "GET",
      headers: api.getHeaders(),
    });
  },

  getProductById: (id) =>
    fetch(`${api.baseURL}/produit/${id}`, {
      method: "GET",
      headers: api.getHeaders(),
    }),

  searchProducts: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${api.baseURL}/search?${queryString}`, {
      method: "GET",
      headers: api.getHeaders(),
    });
  },

  // Categories endpoints
  getCategories: () =>
    fetch(`${api.baseURL}/categories/`, {
      method: "GET",
      headers: api.getHeaders(),
    }),

  // Markets endpoints
  getMarkets: () =>
    fetch(`${api.baseURL}/markets/`, {
      method: "GET",
      headers: api.getHeaders(),
    }),

  getMarketById: (id) =>
    fetch(`${api.baseURL}/markets/${id}`, {
      method: "GET",
      headers: api.getHeaders(),
    }),

  getMarketProducts: (id) =>
    fetch(`${api.baseURL}/markets/${id}/products`, {
      method: "GET",
      headers: api.getHeaders(),
    }),

  // Cart endpoints
  async getCart() {
    return fetch(`${api.baseURL}/cart`, {
      method: "GET",
      headers: api.getHeaders(),
    });
  },

  async addToCart(productId, quantity = 1) {
    return fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJjbGllbnQxQGV4YW1wbGUuY29tIiwicm9sZSI6IkNMSUVOVCIsImlhdCI6MTc2Mzc2ODgzOSwiZXhwIjoxNzYzODU1MjM5fQ.gofRk5sQJn1MVIG9DtEy_BKPh_mb-r7SpTAR8HhfsGM",
      },
      body: JSON.stringify({
        id_produit: productId,
        quantity: quantity,
      }),
    });
  },

  async removeFromCart(id_cart) {
    return fetch(`${api.baseURL}/cart/remove`, {
      method: "POST",
      headers: api.getHeaders(),
      body: JSON.stringify({ id_cart }),
    });
  },

  async clearCart() {
    return fetch(`${api.baseURL}/cart/clear`, {
      method: "POST",
      headers: api.getHeaders(),
    });
  },

  async updateCartItem(id_cart, quantity) {
    return fetch(`${api.baseURL}/cart/update/${id_cart}`, {
      method: "PUT",
      headers: api.getHeaders(),
      body: JSON.stringify({ quantity }),
    });
  },

  getUserOrders: () =>
    fetch(`${api.baseURL}/orders/my-orders`, {
      method: "GET",
      headers: api.getHeaders(),
    }),
};
