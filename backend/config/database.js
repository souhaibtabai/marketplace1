// config/database.js - Fixed version
const { Sequelize } = require("sequelize");

// Try to import config, with fallback
let config;
try {
  config = require("./environment");
} catch (error) {
  console.error("Error loading environment config:", error);
  // Fallback configuration
  config = {
    database: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || "postgres",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    },
    server: {
      env: process.env.NODE_ENV || "development",
    },
  };
}

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "postgres",
    logging: config.server.env === "development" ? console.log : false,
    dialectOptions: {
      ssl:
        config.server.env === "production"
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false, // Keep camelCase
      freezeTableName: true, // Use exact table names
    },
  }
);

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    return false;
  }
};

// Sync models (only in development)
const syncDatabase = async () => {
  try {
    // Disable sync to avoid schema changes
    // await sequelize.sync({ alter: true }); // Comment this out
    console.log("Database sync disabled. Using existing schema.");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

// Export sequelize instance as both named export and default
module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  default: sequelize,

  Sequelize,
  QueryTypes: Sequelize.QueryTypes,
};
