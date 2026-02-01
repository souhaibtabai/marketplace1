const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/environment");

const db = require("../models");
const { QueryTypes } = require("sequelize");

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { ...data }),
  });
};

const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message;
  }

  return res.status(statusCode).json(response);
};

class AuthController {
  async register(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { email, password, username, adresse, phone_number, role } =
        req.body;

      // Validation
      if (!email || !password || !username) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          "Email, mot de passe et nom d'utilisateur sont requis"
        );
      }

      if (password.length < 6) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          "Le mot de passe doit faire au moins 6 caractères"
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await transaction.rollback();
        return sendError(res, 400, "Format d'email invalide");
      }

      // Check for existing user by email
      const existingUsersByEmail = await db.sequelize.query(
        `SELECT id_utilisateur, email FROM utilisateurs WHERE email = $1`,
        {
          bind: [email.toLowerCase().trim()],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingUsersByEmail.length > 0) {
        await transaction.rollback();
        return sendError(res, 400, "Un utilisateur avec cet email existe déjà");
      }

      // Check for existing user by username
      const existingUsersByUsername = await db.sequelize.query(
        `SELECT id_utilisateur, username FROM utilisateurs WHERE username = $1`,
        {
          bind: [username.trim()],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingUsersByUsername.length > 0) {
        await transaction.rollback();
        return sendError(res, 400, "Ce nom d'utilisateur est déjà pris");
      }

      // Validate role
      const validRoles = ["CLIENT", "VENDOR", "CLIENT", "LIVREUR"];
      const userRole = role || "CLIENT";
      if (!validRoles.includes(userRole)) {
        await transaction.rollback();
        return sendError(res, 400, "Rôle invalide");
      }

      // Hash password and create user
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUsers = await db.sequelize.query(
        `INSERT INTO utilisateurs (email, password, username, adresse, phone_number, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id_utilisateur, email, username, adresse, phone_number, role`,
        {
          bind: [
            email.toLowerCase().trim(),
            hashedPassword,
            username.trim(),
            adresse ? adresse.trim() : null,
            phone_number ? phone_number.trim() : null,
            userRole,
          ],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      const user = newUsers[0];
      await transaction.commit();

      // Generate token - Fixed config reference
      const token = jwt.sign(
        {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          role: user.role,
        },
        config.auth?.jwtSecret || config.jwt?.secret || process.env.JWT_SECRET,
        {
          expiresIn:
            config.auth?.jwtExpiresIn || config.jwt?.expiresIn || "24h",
        }
      );

      return sendResponse(res, 201, true, "Utilisateur créé avec succès", {
        user: {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          username: user.username,
          adresse: user.adresse,
          phone_number: user.phone_number,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur lors de l'inscription:", error);
      return sendError(res, 500, "Erreur lors de la création du compte", error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 400, "Email et mot de passe sont requis");
      }

      // Find user by email
      const users = await db.sequelize.query(
        `SELECT id_utilisateur, email, username, password, adresse, phone_number, role
         FROM utilisateurs WHERE email = $1`,
        {
          bind: [email.toLowerCase().trim()],
          type: QueryTypes.SELECT,
        }
      );

      if (users.length === 0) {
        return sendError(res, 401, "Identifiants incorrects");
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return sendError(res, 401, "Identifiants incorrects");
      }

      // Generate token - Fixed config reference
      const token = jwt.sign(
        {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          role: user.role,
        },
        config.auth?.jwtSecret || config.jwt?.secret || process.env.JWT_SECRET,
        {
          expiresIn:
            config.auth?.jwtExpiresIn || config.jwt?.expiresIn || "24h",
        }
      );

      return sendResponse(res, 200, true, "Connexion réussie", {
        user: {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          username: user.username,
          adresse: user.adresse,
          phone_number: user.phone_number,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return sendError(res, 500, "Erreur lors de la connexion", error);
    }
  }

  async getProfile(req, res) {
    try {
      const users = await db.sequelize.query(
        `SELECT id_utilisateur, username, email, adresse, phone_number, role
         FROM utilisateurs WHERE id_utilisateur = $1`,
        {
          bind: [req.user.id_utilisateur],
          type: QueryTypes.SELECT,
        }
      );

      if (users.length === 0) {
        return sendError(res, 404, "Utilisateur non trouvé");
      }

      const user = users[0];
      return sendResponse(res, 200, true, "Profil récupéré avec succès", {
        user: {
          id_utilisateur: user.id_utilisateur,
          username: user.username,
          email: user.email,
          adresse: user.adresse,
          phone_number: user.phone_number,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return sendError(
        res,
        500,
        "Erreur lors de la récupération du profil",
        error
      );
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const {
        username,
        email,
        adresse,
        phone_number,
        currentPassword,
        newPassword,
      } = req.body;
      const userId = req.user.id_utilisateur;

      // Get current user data first
      const currentUsers = await db.sequelize.query(
        `SELECT * FROM utilisateurs WHERE id_utilisateur = $1`,
        {
          bind: [userId],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (currentUsers.length === 0) {
        await transaction.rollback();
        return sendError(res, 404, "Utilisateur non trouvé");
      }

      const currentUser = currentUsers[0];

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          await transaction.rollback();
          return sendError(
            res,
            400,
            "Mot de passe actuel requis pour le changement"
          );
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          currentUser.password
        );
        if (!isCurrentPasswordValid) {
          await transaction.rollback();
          return sendError(res, 400, "Mot de passe actuel incorrect");
        }

        if (newPassword.length < 6) {
          await transaction.rollback();
          return sendError(
            res,
            400,
            "Le nouveau mot de passe doit faire au moins 6 caractères"
          );
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await db.sequelize.query(
          `UPDATE utilisateurs SET password = $1 WHERE id_utilisateur = $2`,
          {
            bind: [hashedNewPassword, userId],
            type: QueryTypes.UPDATE,
            transaction,
          }
        );
      }

      // Validate email format if provided
      if (email && email !== currentUser.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          await transaction.rollback();
          return sendError(res, 400, "Format d'email invalide");
        }

        // Check if email is already taken
        const existingUsers = await db.sequelize.query(
          `SELECT id_utilisateur FROM utilisateurs WHERE email = $1 AND id_utilisateur != $2`,
          {
            bind: [email.toLowerCase().trim(), userId],
            type: QueryTypes.SELECT,
            transaction,
          }
        );

        if (existingUsers.length > 0) {
          await transaction.rollback();
          return sendError(res, 400, "Email déjà utilisé");
        }
      }

      // Check if username is already taken
      if (username && username !== currentUser.username) {
        const existingUsers = await db.sequelize.query(
          `SELECT id_utilisateur FROM utilisateurs WHERE username = $1 AND id_utilisateur != $2`,
          {
            bind: [username.trim(), userId],
            type: QueryTypes.SELECT,
            transaction,
          }
        );

        if (existingUsers.length > 0) {
          await transaction.rollback();
          return sendError(res, 400, "Nom d'utilisateur déjà pris");
        }
      }

      // Build dynamic update query - Fixed parameter binding
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (username) {
        updates.push(`username = $${paramIndex}`);
        values.push(username.trim());
        paramIndex++;
      }
      if (email) {
        updates.push(`email = $${paramIndex}`);
        values.push(email.toLowerCase().trim());
        paramIndex++;
      }
      if (adresse !== undefined) {
        updates.push(`adresse = $${paramIndex}`);
        values.push(adresse ? adresse.trim() : null);
        paramIndex++;
      }
      if (phone_number !== undefined) {
        updates.push(`phone_number = $${paramIndex}`);
        values.push(phone_number ? phone_number.trim() : null);
        paramIndex++;
      }

      if (updates.length > 0) {
        values.push(userId);
        await db.sequelize.query(
          `UPDATE utilisateurs SET ${updates.join(
            ", "
          )} WHERE id_utilisateur = $${paramIndex}`,
          {
            bind: values,
            type: QueryTypes.UPDATE,
            transaction,
          }
        );
      }

      // Get updated user
      const updatedUsers = await db.sequelize.query(
        `SELECT id_utilisateur, username, email, adresse, phone_number, role
         FROM utilisateurs WHERE id_utilisateur = $1`,
        {
          bind: [userId],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      const updatedUser = updatedUsers[0];
      await transaction.commit();

      return sendResponse(res, 200, true, "Profil mis à jour avec succès", {
        user: {
          id_utilisateur: updatedUser.id_utilisateur,
          username: updatedUser.username,
          email: updatedUser.email,
          adresse: updatedUser.adresse,
          phone_number: updatedUser.phone_number,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur lors de la mise à jour du profil:", error);
      return sendError(
        res,
        500,
        "Erreur lors de la mise à jour du profil",
        error
      );
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id_utilisateur;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        await transaction.rollback();
        return sendError(res, 400, "Tous les champs sont requis");
      }

      if (newPassword !== confirmPassword) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          "La confirmation du mot de passe ne correspond pas"
        );
      }

      if (newPassword.length < 6) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          "Le nouveau mot de passe doit faire au moins 6 caractères"
        );
      }

      if (currentPassword === newPassword) {
        await transaction.rollback();
        return sendError(
          res,
          400,
          "Le nouveau mot de passe doit être différent de l'ancien"
        );
      }

      // Get current user with password
      const currentUsers = await db.sequelize.query(
        `SELECT password FROM utilisateurs WHERE id_utilisateur = $1`,
        {
          bind: [userId],
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (currentUsers.length === 0) {
        await transaction.rollback();
        return sendError(res, 404, "Utilisateur non trouvé");
      }

      const currentUser = currentUsers[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );
      if (!isCurrentPasswordValid) {
        await transaction.rollback();
        return sendError(res, 400, "Mot de passe actuel incorrect");
      }

      // Update password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await db.sequelize.query(
        `UPDATE utilisateurs SET password = $1 WHERE id_utilisateur = $2`,
        {
          bind: [hashedNewPassword, userId],
          type: QueryTypes.UPDATE,
          transaction,
        }
      );

      await transaction.commit();
      return sendResponse(res, 200, true, "Mot de passe modifié avec succès");
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur lors du changement de mot de passe:", error);
      return sendError(
        res,
        500,
        "Erreur lors du changement de mot de passe",
        error
      );
    }
  }

  async refreshToken(req, res) {
    try {
      const users = await db.sequelize.query(
        `SELECT id_utilisateur, email, username, role FROM utilisateurs WHERE id_utilisateur = $1`,
        {
          bind: [req.user.id_utilisateur],
          type: QueryTypes.SELECT,
        }
      );

      if (users.length === 0) {
        return sendError(res, 404, "Utilisateur non trouvé");
      }

      const user = users[0];

      // Generate new token - Fixed config reference
      const token = jwt.sign(
        {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          role: user.role,
        },
        config.auth?.jwtSecret || config.jwt?.secret || process.env.JWT_SECRET,
        {
          expiresIn:
            config.auth?.jwtExpiresIn || config.jwt?.expiresIn || "24h",
        }
      );

      return sendResponse(res, 200, true, "Token renouvelé", {
        token,
        user: {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Erreur lors du renouvellement du token:", error);
      return sendError(
        res,
        500,
        "Erreur lors du renouvellement du token",
        error
      );
    }
  }

  async logout(req, res) {
    return sendResponse(
      res,
      200,
      true,
      "Déconnexion réussie. Supprimez le token côté client."
    );
  }

  async validateToken(req, res) {
    try {
      const user = req.user;
      return sendResponse(res, 200, true, "Token valide", {
        user: {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
      return sendError(
        res,
        500,
        "Erreur lors de la validation du token",
        error
      );
    }
  }
}

module.exports = new AuthController();
