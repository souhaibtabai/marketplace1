// middleware/validation.js
const { body, param, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Erreurs de validation",
      errors: errors.array(),
    });
  }
  next();
};

// Product validations
const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Nom requis (1-255 caractères)"),
  body("price").isFloat({ min: 0.01 }).withMessage("Prix doit être > 0"),
  body("stock").isInt({ min: 0 }).withMessage("Stock doit être >= 0"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description trop longue"),
  body("id_categorie").isInt({ min: 1 }).withMessage("Catégorie invalide"),
  body("id_market").isInt({ min: 1 }).withMessage("Market invalide"),
  handleValidationErrors,
];

// Order validations
const validateOrder = [
  body("items").isArray({ min: 1 }).withMessage("Au moins un item requis"),
  body("items.*.id_produit")
    .isInt({ min: 1 })
    .withMessage("ID produit invalide"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantité doit être >= 1"),
  handleValidationErrors,
];

// Category validations
const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Nom requis (1-100 caractères)"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description trop longue"),
  handleValidationErrors,
];

// Market validations
const validateMarket = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Nom requis (1-100 caractères)"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description trop longue"),
  handleValidationErrors,
];

// Pagination validations
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page doit être >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit entre 1-100"),
  handleValidationErrors,
];

// Search validations
const validateSearch = [
  query("q")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Recherche trop longue"),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Prix minimum invalide"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Prix maximum invalide"),
  ...validatePagination,
];

// ID parameter validation
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID invalide"),
  handleValidationErrors,
];

module.exports = {
  validateProduct,
  validateOrder,
  validateCategory,
  validateMarket,
  validatePagination,
  validateSearch,
  validateId,
  handleValidationErrors,
};
