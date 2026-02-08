const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.resolve(
    __dirname,
    `../.env.${process.env.NODE_ENV || "development"}`
  ),
});

const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
