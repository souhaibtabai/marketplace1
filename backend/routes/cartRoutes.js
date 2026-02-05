const express = require("express");
const router = express.Router();
const { CartController } = require("../controllers/cartController");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/cart/add", authenticateUser, CartController.addToCart);
router.get("/cart", authenticateUser, CartController.getCart);
router.post("/cart/remove", authenticateUser, CartController.removeFromCart);
router.post("/cart/clear", authenticateUser, CartController.clearCart);

module.exports = router;
