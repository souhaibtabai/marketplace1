const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Try to load environment-specific .env file first, then fallback to .env
const nodeEnv = process.env.NODE_ENV || "development";
const envPath = path.resolve(__dirname, `../.env.${nodeEnv}`);
const defaultEnvPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded environment from .env.${nodeEnv}`);
} else if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
  console.log(`✅ Loaded environment from .env (fallback)`);
} else {
  console.log(`ℹ️  No .env file found, using process.env variables`);
}

const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174,https://marketplace-site-a8bm.onrender.com,https://marketplace-dashboard-tfqs.onrender.com",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
  auth: {
    JWTSECRET:
      process.env.JWT_SECRET ||
      "souhaib5ertyrtyuikjhgfdcdzertyjhgbfvdhy5154fvdwcdsg8619v1v6fdb16vd1b63fd1vsdf6b16",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
};

module.exports = config;
