const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/orderController");
const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authMiddleware");

// All order routes require authentication
router.use(authenticateUser);

// ⭐ IMPORTANT: Put specific routes FIRST, before parameterized routes!

// GET all orders - MUST be before /:id
router.get(
  "/orders",
  authorizeRoles(["admin", "VENDOR"]),
  OrderController.getAllOrders
);

// Client routes
router.post("/", OrderController.createOrder);
router.get("/myorder", OrderController.getUserOrders);

// Routes with :id parameter - PUT THESE LAST!

router.get("/:id/products", OrderController.getOrderProducts);
router.patch("/:id/cancel", OrderController.cancelOrder);
router.patch(
  "/:id/status",
  authorizeRoles(["admin", "VENDOR"]),
  OrderController.updateOrderStatus
);
router.get("/:id", OrderController.getOrderById);

module.exports = router;
