const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

// Import sequelize instance from config
const sequelizeConfig = require("../config/database");
const sequelize =
  sequelizeConfig.sequelize || sequelizeConfig.default || sequelizeConfig;

if (!sequelize || typeof sequelize.define !== "function") {
  console.error("Sequelize instance not properly initialized");
  process.exit(1);
}

const db = {};

// List of model files
const modelFiles = [
  "User.js",
  "categorie.js",
  "market.js",
  "Product.js",
  "Order.js",
  "cart.js",
  "business.js",
];

// Load models
modelFiles.forEach((file) => {
  const modelPath = path.join(__dirname, file);
  if (fs.existsSync(modelPath)) {
    // Support both function and direct exports
    const modelExport = require(modelPath);
    const model =
      typeof modelExport === "function"
        ? modelExport(sequelize, DataTypes)
        : modelExport;
    db[model.name] = model;
    console.log(`✅ Model ${model.name} loaded successfully`);
  } else {
    console.warn(`⚠️  Model file ${file} not found`);
  }
});

// Setup associations if defined
Object.values(db).forEach((model) => {
  if (model.associate && typeof model.associate === "function") {
    model.associate(db);
    console.log(`✅ Associations for ${model.name} defined`);
  }
});

// Alias for common names
if (db.Utilisateur) db.User = db.Utilisateur;
if (db.Produit) db.Product = db.Produit;
if (db.Categorie) db.Category = db.Categorie;

// Add sequelize instance and constructor
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

// Sync models
sequelize.sync();

module.exports = {
  ...db,
  testConnection,
};
