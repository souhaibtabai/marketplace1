const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { sequelize, QueryTypes } = require("../config/database");

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
  skipSuccessfulRequests: true,
});

// LOGIN ENDPOINT
router.post("/login", loginLimiter, async (req, res) => {
  try {
    console.log("Login attempt:", { email: req.body.email });

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email et mot de passe requis",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        error: true,
        message: "Format d'email invalide",
      });
    }

    // Find user in database using raw SQL
    const users = await sequelize.query(
      `SELECT id_utilisateur, email, password, username, role, adresse, phone_number 
       FROM utilisateurs 
       WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email))`,
      {
        replacements: { email: email },
        type: QueryTypes.SELECT,
      }
    );

    const user = users[0]; // Get first result

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id_utilisateur,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET ||
        "souhaib5ertyrtyuikjhgfdcdzertyjhgbfvdhy5154fvdwcdsg8619v1v6fdb16vd1b63fd1vsdf6b16",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token: token,
      user: {
        id: user.id_utilisateur,
        email: user.email,
        username: user.username,
        role: user.role,
        adresse: user.adresse,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: true,
      message: "Erreur interne du serveur",
    });
  }
});
router.post("/business-account-request", async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "email",
      "username",
      "phone_number",
      "company_name",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Le champ ${field} est requis`,
        });
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({
        error: "Veuillez entrer une adresse email valide",
      });
    }

    // Create new request
    const newRequest = await sequelize.create({
      email: req.body.email,
      username: req.body.username,
      phone_number: req.body.phone_number,
      company_name: req.body.company_name,
      business_type: "other",
      requested_role: req.body.requested_role || "VENDOR",
      description: req.body.description,
      address: req.body.address,
      tax_number: req.body.tax_number,
    });

    res.status(201).json({
      message: "Votre demande a été soumise avec succès",
      requestId: newRequest.id,
    });
  } catch (error) {
    console.error("Error submitting business account request:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        error: "Validation error",
        details: errors,
      });
    }

    res.status(500).json({
      error: "Une erreur est survenue lors du traitement de votre demande",
    });
  }
});

// REGISTER ENDPOINT
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      role = "CLIENT",
      adresse,
      phone_number,
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email et mot de passe requis",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: "Le mot de passe doit faire au moins 6 caractères",
      });
    }

    // Check if user already exists using raw SQL
    const existingUsers = await sequelize.query(
      `SELECT id_utilisateur FROM utilisateurs 
       WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email))`,
      {
        replacements: { email: email },
        type: QueryTypes.SELECT,
      }
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: true,
        message: "Un compte avec cet email existe déjà",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );

    // Create new user using raw SQL
    const [newUsers] = await sequelize.query(
      `INSERT INTO utilisateurs (email, password, username, role, adresse, phone_number, created_at, updated_at)
       VALUES (:email, :password, :username, :role, :adresse, :phone_number, NOW(), NOW())
       RETURNING id_utilisateur, email, username, role, adresse, phone_number`,
      {
        replacements: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          username: username || email.split("@")[0],
          role: role,
          adresse: adresse || null,
          phone_number: phone_number || null,
        },
        type: QueryTypes.INSERT,
      }
    );

    // For databases that don't support RETURNING, we need to get the inserted user
    let newUser;
    if (newUsers && newUsers.length > 0) {
      newUser = newUsers[0];
    } else {
      // Fallback for databases without RETURNING support (like MySQL)
      const insertedUsers = await sequelize.query(
        `SELECT id_utilisateur, email, username, role, adresse, phone_number 
         FROM utilisateurs 
         WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email))`,
        {
          replacements: { email: email.toLowerCase().trim() },
          type: QueryTypes.SELECT,
        }
      );
      newUser = insertedUsers[0];
    }

    console.log("New user registered:", email);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id_utilisateur,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      token: token,
      user: {
        id: newUser.id_utilisateur,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        adresse: newUser.adresse,
        phone_number: newUser.phone_number,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle unique constraint violations
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.message.includes("unique") ||
      error.message.includes("duplicate")
    ) {
      return res.status(409).json({
        error: true,
        message: "Email ou nom d'utilisateur déjà utilisé",
      });
    }

    res.status(500).json({
      error: true,
      message: "Erreur interne du serveur",
    });
  }
});

module.exports = router;
