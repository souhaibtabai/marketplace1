module.exports = {
  ORDER_STATUS: {
    PENDING: "pending",
    IN_PROGRESS: "en_cours",
    CONFIRMED: "CONFIRMED",
    SHIPPED: "SHIPPED",
    DELIVERED: "delivered",
    CANCELLED: "canceled",
    RETURNED: "returned",
  },
  USER_ROLES: {
    admin: "admin",
    CLIENT: "client",
    VENDOR: "vendor",
    LIVREUR: "livreur",
  },
  PAYMENT_STATUS: {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
  },
  PAYMENT_METHOD: {
    CASH: "CASH",
    CARD: "CARD",
    BANK_TRANSFER: "BANK_TRANSFER",
    MOBILE_PAYMENT: "MOBILE_PAYMENT",
  },
};
