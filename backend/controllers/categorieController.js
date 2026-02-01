const { sequelize } = require("../config/database");

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const categories = await sequelize.query(
        `SELECT * FROM categories ORDER BY name`,
        { type: sequelize.QueryTypes.SELECT }
      );
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCategoryById(req, res) {
    try {
      const category = await sequelize.query(
        `SELECT * FROM categories WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!category.length) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      // Get products count for this category
      const [productCount] = await sequelize.query(
        `SELECT COUNT(*)::int as product_count FROM produits WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.json({
        ...category[0],
        product_count: productCount.product_count,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const { name, Description } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const [newCategory] = await sequelize.query(
        `INSERT INTO categories (name, "Description") VALUES (:name, :Description) RETURNING *`,
        {
          replacements: { name, Description },
          type: sequelize.QueryTypes.INSERT,
        }
      );

      res.status(201).json({
        message: "Catégorie créée avec succès",
        category: newCategory,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const category = await sequelize.query(
        `SELECT * FROM categories WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!category.length) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      const updateFields = [];
      const replacements = { id: req.params.id };

      if (req.body.name !== undefined) {
        updateFields.push(`name = :name`);
        replacements.name = req.body.name;
      }

      if (req.body.Description !== undefined) {
        updateFields.push(`"Description" = :Description`);
        replacements.Description = req.body.Description;
      }

      if (!updateFields.length) {
        return res.status(400).json({ message: "No data to update" });
      }

      const [updatedCategory] = await sequelize.query(
        `UPDATE categories SET ${updateFields.join(
          ", "
        )} WHERE id_categorie = :id RETURNING *`,
        { replacements, type: sequelize.QueryTypes.UPDATE }
      );

      res.json({
        message: "Catégorie mise à jour",
        category: updatedCategory,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const category = await sequelize.query(
        `SELECT * FROM categories WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!category.length) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      // Check if category has products
      const [productCount] = await sequelize.query(
        `SELECT COUNT(*)::int as count FROM produits WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (productCount.count > 0) {
        return res.status(400).json({
          message: "Cannot delete category with existing products",
        });
      }

      await sequelize.query(`DELETE FROM categories WHERE id_categorie = :id`, {
        replacements: { id: req.params.id },
        type: sequelize.QueryTypes.DELETE,
      });

      res.json({ message: "Catégorie supprimée" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getParentCategories(req, res) {
    try {
      const parentCategories = await sequelize.query(
        `SELECT id_categorie, name 
         FROM categories 
         WHERE id_categorie != :id 
         ORDER BY name ASC`,
        {
          replacements: { id: req.params.id_categorie || 0 },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.status(200).json({
        success: true,
        parentCategories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategoryProducts(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const products = await sequelize.query(
        `SELECT p.*, m.name as market_name 
         FROM produits p 
         LEFT JOIN market m ON p.id_market = m.id_market 
         WHERE p.id_categorie = :id 
         LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            id: req.params.id,
            limit: parseInt(limit),
            offset,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const [{ count }] = await sequelize.query(
        `SELECT COUNT(*)::int AS count FROM produits WHERE id_categorie = :id`,
        {
          replacements: { id: req.params.id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      res.json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();
