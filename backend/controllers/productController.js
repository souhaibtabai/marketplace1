const { sequelize, default: pool } = require("../config/database");
const { QueryTypes } = require("sequelize");

class ProductController {
  async getproduct(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "id_produit",
        sortOrder = "DESC",
      } = req.query;
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offset = (pageInt - 1) * limitInt;

      // Validate pagination parameters
      if (pageInt < 1 || limitInt < 1) {
        return res
          .status(400)
          .json({ message: "Paramètres de pagination invalides" });
      }

      // Validate sort parameters
      const validSortFields = [
        "id_produit",
        "name",
        "price",
        "stock",
        "created_at",
      ];
      const validSortOrders = ["ASC", "DESC"];

      const sortField = validSortFields.includes(sortBy)
        ? sortBy
        : "id_produit";
      const order = validSortOrders.includes(sortOrder.toUpperCase())
        ? sortOrder.toUpperCase()
        : "DESC";

      const products = await sequelize.query(
        `
      SELECT p.*, m.name AS market_name, c.name AS category_name
      FROM produits p
      LEFT JOIN market m ON p.id_market = m.id_market
      LEFT JOIN categories c ON p.id_categorie = c.id_categorie
      WHERE p.stock > 0
      ORDER BY p.${sortField} ${order}
      LIMIT $1 OFFSET $2
      `,
        {
          bind: [limitInt, offset],
          type: QueryTypes.SELECT,
        }
      );

      const countResult = await sequelize.query(
        `SELECT COUNT(*)::int AS count FROM produits WHERE stock > 0`,
        {
          type: QueryTypes.SELECT,
        }
      );

      const count = countResult[0].count;

      res.status(200).json({
        products,
        totalPages: Math.ceil(count / limitInt),
        currentPage: pageInt,
        total: count,
        hasNextPage: pageInt < Math.ceil(count / limitInt),
        hasPrevPage: pageInt > 1,
      });
    } catch (error) {
      console.error("Error in getproduct:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await sequelize.query(
        `
        SELECT p.*, m.name AS market_name, c.name AS category_name
        FROM produits p
        LEFT JOIN market m ON p.id_market = m.id_market
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        WHERE p.id_produit = $1
        `,
        {
          bind: [req.params.id],
          type: QueryTypes.SELECT,
        }
      );

      if (!product.length) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      res.json(product[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // In your createProduct method, replace lines 83-95 with this:

  async createProduct(req, res) {
    try {
      const { name, price, stock, description, id_categorie, id_market } =
        req.body;

      if (!name || !price || !stock || !id_categorie || !id_market) {
        return res.status(400).json({
          message: "Tous les champs obligatoires doivent être fournis",
        });
      }

      // Only check if market exists (remove ownership check)
      if (req.user.role === "VENDOR" || req.user.role === "admin") {
        const market = await sequelize.query(
          `SELECT * FROM market WHERE id_market = $1`, // Removed the AND id_utilisateur = $2 condition
          {
            bind: [id_market], // Removed req.user.id_utilisateur from bind
            type: QueryTypes.SELECT,
          }
        );
        if (!market.length) {
          return res.status(404).json({ message: "Market non trouvé" });
        }
      }

      // Rest of your code remains the same...
      const category = await sequelize.query(
        `SELECT * FROM categories WHERE id_categorie = $1`,
        {
          bind: [id_categorie],
          type: QueryTypes.SELECT,
        }
      );
      if (!category.length) {
        return res.status(400).json({ message: "Catégorie non trouvée" });
      }

      const newProduct = await sequelize.query(
        `
      INSERT INTO produits (name, price, stock, description, id_categorie, id_market)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
        {
          bind: [name, price, stock, description, id_categorie, id_market],
          type: QueryTypes.INSERT,
        }
      );

      res.status(201).json({
        message: "Produit créé avec succès",
        product: newProduct[0],
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit = $1`,
        {
          bind: [id],
          type: QueryTypes.SELECT,
        }
      );

      if (!product.length) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (req.user.role === "VENDOR") {
        const market = await sequelize.query(
          `SELECT * FROM market WHERE id_market = $1 AND id_utilisateur = $2`,
          {
            bind: [product[0].id_market, req.user.id_utilisateur],
            type: QueryTypes.SELECT,
          }
        );
        if (!market.length) {
          return res.status(403).json({ message: "Non autorisé" });
        }
      }

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      [
        "name",
        "price",
        "stock",
        "description",
        "id_categorie",
        "id_market",
      ].forEach((field) => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(req.body[field]);
          paramIndex++;
        }
      });

      if (!updateFields.length) {
        return res
          .status(400)
          .json({ message: "Aucune donnée à mettre à jour" });
      }

      values.push(id); // Add id as the last parameter

      const updated = await sequelize.query(
        `
        UPDATE produits
        SET ${updateFields.join(", ")}
        WHERE id_produit = $${paramIndex}
        RETURNING *
        `,
        {
          bind: values,
          type: QueryTypes.UPDATE,
        }
      );

      res.json({ message: "Produit mis à jour", product: updated[0] });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit = $1`,
        {
          bind: [id],
          type: QueryTypes.SELECT,
        }
      );

      if (!product.length) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (req.user.role === "VENDOR") {
        const market = await sequelize.query(
          `SELECT * FROM market WHERE id_market = $1 AND id_utilisateur = $2`,
          {
            bind: [product[0].id_market, req.user.id_utilisateur],
            type: QueryTypes.SELECT,
          }
        );
        if (!market.length) {
          return res.status(403).json({ message: "Non autorisé" });
        }
      }

      await sequelize.query(`DELETE FROM produits WHERE id_produit = $1`, {
        bind: [id],
        type: QueryTypes.DELETE,
      });

      res.json({ message: "Produit supprimé" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const { stock } = req.body;
      const { id } = req.params;

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ message: "Stock invalide" });
      }

      const product = await sequelize.query(
        `SELECT * FROM produits WHERE id_produit = $1`,
        {
          bind: [id],
          type: QueryTypes.SELECT,
        }
      );

      if (!product.length) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      if (req.user.role === "VENDOR") {
        const market = await sequelize.query(
          `SELECT * FROM market WHERE id_market = $1 AND id_utilisateur = $2`,
          {
            bind: [product[0].id_market, req.user.id_utilisateur],
            type: QueryTypes.SELECT,
          }
        );
        if (!market.length) {
          return res.status(403).json({ message: "Non autorisé" });
        }
      }

      const updated = await sequelize.query(
        `UPDATE produits SET stock = $1 WHERE id_produit = $2 RETURNING *`,
        {
          bind: [stock, id],
          type: QueryTypes.UPDATE,
        }
      );

      res.json({ message: "Stock mis à jour", product: updated[0] });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { id_categorie } = req.params;

      // Validate parameters
      if (!id_categorie) {
        return res.status(400).json({ message: "ID de catégorie requis" });
      }

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offset = (pageInt - 1) * limitInt;

      // Validate pagination parameters
      if (pageInt < 1 || limitInt < 1) {
        return res
          .status(400)
          .json({ message: "Paramètres de pagination invalides" });
      }

      const products = await sequelize.query(
        `
        SELECT p.*, m.name AS market_name, c.name AS category_name
        FROM produits p
        LEFT JOIN market m ON p.id_market = m.id_market
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        WHERE p.id_categorie = $1 AND p.stock > 0
        ORDER BY p.id_produit DESC
        LIMIT $2 OFFSET $3
        `,
        {
          bind: [id_categorie, limitInt, offset],
          type: QueryTypes.SELECT,
        }
      );

      const countResult = await sequelize.query(
        `SELECT COUNT(*)::int AS count FROM produits WHERE id_categorie = $1 AND stock > 0`,
        {
          bind: [id_categorie],
          type: QueryTypes.SELECT,
        }
      );

      const count = countResult[0].count;

      res.json({
        products,
        totalPages: Math.ceil(count / limitInt),
        currentPage: pageInt,
        total: count,
        hasNextPage: pageInt < Math.ceil(count / limitInt),
        hasPrevPage: pageInt > 1,
      });
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async getProductsByMarket(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { id_market } = req.params;

      // Validate parameters
      if (!id_market) {
        return res.status(400).json({ message: "ID de market requis" });
      }

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offset = (pageInt - 1) * limitInt;

      // Validate pagination parameters
      if (pageInt < 1 || limitInt < 1) {
        return res
          .status(400)
          .json({ message: "Paramètres de pagination invalides" });
      }

      const products = await sequelize.query(
        `
        SELECT p.*, m.name AS market_name, c.name AS category_name
        FROM produits p
        LEFT JOIN market m ON p.id_market = m.id_market
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        WHERE p.id_market = $1 AND p.stock > 0
        ORDER BY p.id_produit DESC
        LIMIT $2 OFFSET $3
        `,
        {
          bind: [id_market, limitInt, offset],
          type: QueryTypes.SELECT,
        }
      );

      const countResult = await sequelize.query(
        `SELECT COUNT(*)::int AS count FROM produits WHERE id_market = $1 AND stock > 0`,
        {
          bind: [id_market],
          type: QueryTypes.SELECT,
        }
      );

      const count = countResult[0].count;

      res.json({
        products,
        totalPages: Math.ceil(count / limitInt),
        currentPage: pageInt,
        total: count,
        hasNextPage: pageInt < Math.ceil(count / limitInt),
        hasPrevPage: pageInt > 1,
      });
    } catch (error) {
      console.error("Error in getProductsByMarket:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async searchProducts(req, res) {
    try {
      const {
        q,
        category,
        market,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
      } = req.query;

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const offset = (pageInt - 1) * limitInt;

      // Validate pagination parameters
      if (pageInt < 1 || limitInt < 1) {
        return res
          .status(400)
          .json({ message: "Paramètres de pagination invalides" });
      }

      let whereClauses = [];
      let values = [];
      let paramIndex = 1;

      // Build WHERE clauses dynamically
      if (q && q.trim()) {
        whereClauses.push(
          `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
        );
        values.push(`%${q.trim()}%`);
        paramIndex++;
      }

      if (category) {
        whereClauses.push(`p.id_categorie = $${paramIndex}`);
        values.push(category);
        paramIndex++;
      }

      if (market) {
        whereClauses.push(`p.id_market = $${paramIndex}`);
        values.push(market);
        paramIndex++;
      }

      if (minPrice && !isNaN(parseFloat(minPrice))) {
        whereClauses.push(`p.price >= $${paramIndex}`);
        values.push(parseFloat(minPrice));
        paramIndex++;
      }

      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        whereClauses.push(`p.price <= $${paramIndex}`);
        values.push(parseFloat(maxPrice));
        paramIndex++;
      }

      // Add stock > 0 filter to show only available products
      whereClauses.push(`p.stock > 0`);

      const whereSQL = whereClauses.length
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

      // Get products with pagination
      const searchValues = [...values, limitInt, offset];
      const products = await sequelize.query(
        `
        SELECT p.*, m.name AS market_name, c.name AS category_name
        FROM produits p
        LEFT JOIN market m ON p.id_market = m.id_market
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        ${whereSQL}
        ORDER BY p.id_produit DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `,
        {
          bind: searchValues,
          type: QueryTypes.SELECT,
        }
      );

      // Get total count for pagination
      const countResult = await sequelize.query(
        `
        SELECT COUNT(*)::int AS count
        FROM produits p
        LEFT JOIN market m ON p.id_market = m.id_market
        LEFT JOIN categories c ON p.id_categorie = c.id_categorie
        ${whereSQL}
        `,
        {
          bind: values,
          type: QueryTypes.SELECT,
        }
      );

      const count = countResult[0].count;

      res.json({
        products,
        totalPages: Math.ceil(count / limitInt),
        currentPage: pageInt,
        total: count,
        hasNextPage: pageInt < Math.ceil(count / limitInt),
        hasPrevPage: pageInt > 1,
        searchQuery: {
          q: q || null,
          category: category || null,
          market: market || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
        },
      });
    } catch (error) {
      console.error("Error in searchProducts:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
