const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categorieController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Public routes (will be /api/categories/ when mounted)
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.get("/:id/products", CategoryController.getCategoryProducts);
router.get("/parents", CategoryController.getParentCategories);
router.get(
  "/parents/:currentCategoryId",
  CategoryController.getParentCategories
);
// Protected routes
router.post("/", authenticateUser, CategoryController.createCategory);
router.put("/:id", authenticateUser, CategoryController.updateCategory);
router.delete("/:id", authenticateUser, CategoryController.deleteCategory);

module.exports = router;
