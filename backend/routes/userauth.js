const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authMiddleware");

// ✅ FIX: Remove authenticateUser middleware from login and register
// These routes should be PUBLIC - users can't be authenticated before logging in!
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

// ✅ These routes SHOULD be protected (user must be logged in)
router.put("/update-profile", authenticateUser, AuthController.updateProfile);
router.post(
  "/change-password",
  authenticateUser,
  AuthController.changePassword
);
router.get("/profile", authenticateUser, AuthController.getProfile);
router.post("/logout", authenticateUser, AuthController.logout);

module.exports = router;
