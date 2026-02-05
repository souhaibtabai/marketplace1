const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

class MarketController {
  async getAllMarkets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get shops (markets)
      const shops = await sequelize.query(
        `SELECT * FROM market ORDER BY name LIMIT :limit OFFSET :offset`,
        {
          replacements: { limit, offset },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      // Get total count
      const countResult = await sequelize.query(
        `SELECT COUNT(*) as count FROM market`,
        {
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );
      const count = countResult[0].count;
      const totalPages = Math.ceil(count / limit);

      res.json({
        shops,
        pagination: {
          currentPage: page,
          totalPages,
          totalShops: count,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des marchés",
        error: error.message,
      });
    }
  }

  async getMarketById(req, res) {
    try {
      const market = await sequelize.query(
        `SELECT m.*, u.username 
         FROM market m 
         LEFT JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur 
         WHERE m.id_market = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      if (!market.length) {
        return res.status(404).json({ message: "Market non trouvé" });
      }

      res.json(market[0]);
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération du market",
        error: error.message,
      });
    }
  }

  async getMarketDetails(req, res) {
    try {
      // Récupérer les détails du marché
      const markets = await sequelize.query(
        `SELECT m.*, u.username 
         FROM market m 
         LEFT JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur 
         WHERE m.id_market = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      if (!markets.length) {
        return res.status(404).json({ message: "Market non trouvé" });
      }

      // Récupérer les produits du marché
      const products = await sequelize.query(
        `SELECT p.*, c.name as category_name 
         FROM produits p 
         LEFT JOIN categories c ON p.id_categorie = c.id_categorie 
         WHERE p.id_market = :id 
         LIMIT 10`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      res.json({
        ...markets[0],
        products,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des détails du market",
        error: error.message,
      });
    }
  }

  async createMarket(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { name, description } = req.body;

      // Validation améliorée
      if (!name || name.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "Le nom doit contenir au moins 3 caractères" });
      }

      // Vérifier si le market existe déjà
      const existingMarket = await sequelize.query(
        `SELECT * FROM market WHERE name = :name`,
        {
          replacements: { name },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (existingMarket.length) {
        await transaction.rollback();
        return res
          .status(409)
          .json({ message: "Un market avec ce nom existe déjà" });
      }

      const [newMarket] = await sequelize.query(
        `INSERT INTO market (name, description, id_utilisateur, created_at) 
         VALUES (:name, :description, :id_utilisateur, NOW()) 
         RETURNING *`,
        {
          replacements: {
            name,
            description: description || null,
            id_utilisateur: req.user.id_utilisateur,
          },
          type: sequelize.QueryTypes.INSERT,
          transaction,
        }
      );

      await transaction.commit();

      res.status(201).json({
        message: "Market créé avec succès",
        market: newMarket,
      });
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({
        message: "Erreur lors de la création du market",
        error: error.message,
      });
    }
  }

  async updateMarket(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const market = await sequelize.query(
        `SELECT * FROM market WHERE id_market = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!market.length) {
        await transaction.rollback();
        return res.status(404).json({ message: "Market non trouvé" });
      }

      // Vérification des permissions
      if (
        req.user.role === "VENDOR" &&
        market[0].id_utilisateur !== req.user.id_utilisateur
      ) {
        await transaction.rollback();
        return res.status(403).json({ message: "Non autorisé" });
      }

      const updateFields = [];
      const replacements = { id: req.params.id };

      // Validation et préparation des champs à mettre à jour
      ["name", "description"].forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === "name" && req.body[field].trim().length < 3) {
            throw new Error("Le nom doit contenir au moins 3 caractères");
          }
          updateFields.push(`${field} = :${field}`);
          replacements[field] = req.body[field];
        }
      });

      if (!updateFields.length) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Aucune donnée à mettre à jour" });
      }

      const [updatedMarket] = await sequelize.query(
        `UPDATE market 
         SET ${updateFields.join(", ")}, updated_at = NOW() 
         WHERE id_market = :id 
         RETURNING *`,
        {
          replacements,
          type: sequelize.QueryTypes.UPDATE,
          transaction,
        }
      );

      await transaction.commit();

      res.json({
        message: "Market mis à jour avec succès",
        market: updatedMarket,
      });
    } catch (error) {
      await transaction.rollback();
      res.status(400).json({
        message: "Erreur lors de la mise à jour du market",
        error: error.message,
      });
    }
  }

  async deleteMarket(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const market = await sequelize.query(
        `SELECT * FROM market WHERE id_market = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!market.length) {
        await transaction.rollback();
        return res.status(404).json({ message: "Market non trouvé" });
      }

      // Vérification des permissions
      if (
        req.user.role === "VENDOR" &&
        market[0].id_utilisateur !== req.user.id_utilisateur
      ) {
        await transaction.rollback();
        return res.status(403).json({ message: "Non autorisé" });
      }

      // Suppression des produits associés (optionnel)
      await sequelize.query(`DELETE FROM produits WHERE id_market = :id`, {
        replacements: { id: req.params.id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      });

      // Suppression du market
      await sequelize.query(`DELETE FROM market WHERE id_market = :id`, {
        replacements: { id: req.params.id },
        type: sequelize.QueryTypes.DELETE,
        transaction,
      });

      await transaction.commit();

      res.json({ message: "Market supprimé avec succès" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({
        message: "Erreur lors de la suppression du market",
        error: error.message,
      });
    }
  }

  async getMarketProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const products = await sequelize.query(
        `SELECT p.*, c.name as category_name 
         FROM produits p 
         LEFT JOIN categories c ON p.id_categorie = c.id_categorie 
         WHERE p.id_market = :id
         LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            id: req.params.id,
            limit,
            offset,
          },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      const totalProducts = await sequelize.query(
        `SELECT COUNT(*) as count 
         FROM produits 
         WHERE id_market = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      const totalPages = Math.ceil(totalProducts[0].count / limit);

      res.json({
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: totalProducts[0].count,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des produits",
        error: error.message,
      });
    }
  }
}

module.exports = new MarketController();
