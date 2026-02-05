const express = require("express");
const router = express.Router();
const MarketController = require("../controllers/marketController");
const { authorizeRoles } = require("../middleware/authMiddleware");

// Public routes (will be /api/markets/ when mounted)
router.get("/", MarketController.getAllMarkets);
router.get("/:id", MarketController.getMarketById);
router.get("/:id/products", MarketController.getMarketDetails);

// Protected routes
router.post(
  "/create",
  authorizeRoles(["admin"]),
  MarketController.createMarket
);
router.put("/:id", authorizeRoles(["admin"]), MarketController.updateMarket);
router.delete("/:id", authorizeRoles(["admin"]), MarketController.deleteMarket);

module.exports = router;
