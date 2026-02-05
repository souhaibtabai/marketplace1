// config/database.js - Fixed for Render deployment
const { Sequelize } = require("sequelize");

let config;
try {
  config = require("./environment");
} catch (error) {
  console.error("Error loading environment config:", error);
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

// ✅ Use DATABASE_URL in production, individual config in development
let sequelize;

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render
  console.log("🔧 Using DATABASE_URL for production");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  });
} else {
  // Development: Use individual config values
  console.log("🔧 Using individual DB config for development");
  sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: "postgres",
      logging: config.server.env === "development" ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
      },
    },
  );
}

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

const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database synced in development mode");
    } else {
      console.log("⏭️  Database sync disabled in production");
    }
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  default: sequelize,
  Sequelize,
  QueryTypes: Sequelize.QueryTypes,
};
