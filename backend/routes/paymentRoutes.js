const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");
const {
  authorizeRoles,
  authenticateUser,
} = require("../middleware/authMiddleware");

// All payment routes require authentication
router.use(authenticateUser);

// Create a payment for an order
router.post("/", PaymentController.createPayment);

// Get payment by order ID
router.get("/order/:orderId", PaymentController.getPaymentByOrder);

// Confirm a payment (admin, vendor, or payment owner)
router.patch("/:id/confirm", PaymentController.confirmPayment);

// Get all payments (admin only)
router.get(
  "/all",
  authorizeRoles(["admin"]),
  PaymentController.getAllPayments
);

module.exports = router;
