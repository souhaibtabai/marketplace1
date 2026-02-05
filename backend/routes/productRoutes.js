const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get("/produit", ProductController.getproduct);
router.get("/search", ProductController.searchProducts);
router.get("/categorIE/:id_categorie", ProductController.getProductsByCategory);
router.get("/market/:id_market", ProductController.getProductsByMarket);
router.get("/:id", ProductController.getProductById);

router.post("/create", authenticateUser, ProductController.createProduct);

router.put("/:id", authenticateUser, ProductController.updateProduct);

router.delete("/:id", authenticateUser, ProductController.deleteProduct);

router.patch(
  "/:id/stock",
  authenticateUser,
  authorizeRoles("admin", "VENDOR"),
  ProductController.updateStock
);

module.exports = router;
