// middleware/authMiddleware.js - Fixed version
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");
const config = require("../config/environment");

// JWT Authentication Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token, // Use the secret from the config
      config.auth.JWTSECRET ||
        "souhaib5ertyrtyuikjhgfdcdzertyjhgbfvdhy5154fvdwcdsg8619v1v6fdb16"
    );

    // Get user from database using raw SQL for consistency
    const users = await sequelize.query(
      `SELECT id_utilisateur, email, username, role, adresse, phone_number, password
       FROM utilisateurs WHERE id_utilisateur = $1`,
      {
        bind: [decoded.id_utilisateur || decoded.id],
        type: QueryTypes.SELECT,
      }
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    const user = users[0];

    // Add user to request object
    req.user = {
      id_utilisateur: user.id_utilisateur,
      email: user.email,
      username: user.username,
      role: user.role,
      adresse: user.adresse,
      phone_number: user.phone_number,
      password: user.password, // Include for password change operations
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Token expiré",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur de vérification du token",
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  // console.log("roles DSFDF", roles);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôles autorisés: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// admin only middleware
const requireadmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Accès administrateur requis",
    });
  }
  next();
};

// Vendor ownership check middleware
const requireVendorOwnership = (entityType) => {
  return async (req, res, next) => {
    if (req.user.role === "admin") {
      return next(); // admins can access everything
    }

    if (req.user.role !== "VENDOR") {
      return res.status(403).json({
        success: false,
        message: "Accès vendeur requis",
      });
    }

    try {
      const entityId = req.params.id;
      let query = "";

      switch (entityType) {
        case "market":
          query = `SELECT id_utilisateur FROM market WHERE id_market = $1`;
          break;
        case "product":
          query = `SELECT m.id_utilisateur FROM produits p 
                   JOIN market m ON p.id_market = m.id_market 
                   WHERE p.id_produit = $1`;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Type d'entité non supporté",
          });
      }

      const result = await sequelize.query(query, {
        bind: [entityId],
        type: QueryTypes.SELECT,
      });

      if (
        !result.length ||
        result[0].id_utilisateur !== req.user.id_utilisateur
      ) {
        return res.status(403).json({
          success: false,
          message: "Vous ne pouvez accéder qu'à vos propres ressources",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des permissions",
      });
    }
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  requireadmin,
  requireVendorOwnership,
};
