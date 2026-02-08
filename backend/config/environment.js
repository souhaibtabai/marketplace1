const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`,
  ),
});

const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
    // CORS configuration - supports multiple domains separated by comma
    corsOrigin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((url) => url.trim())
      : [
          "https://marketplace-site-a8bm.onrender.com/",
          "https://marketplace-dashboard-tfqs.onrender.com",
        ],
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
  auth: {
    JWTSECRET:
      process.env.JWT_SECRET ||
      "souhaib5ertyrtyuikjhgfdcdzertyJhgbfvdhy5154fvdwcdsg8619v1v6fdb16vd1",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
};

module.exports = config;
