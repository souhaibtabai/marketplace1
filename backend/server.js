const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const db = require("./models");
const config = require("./config/environment");
const { testConnection, syncDatabase } = require("./config/database");
const {
  jsonResponseMiddleware,
  jsonErrorHandler,
  notFoundHandler,
} = require("./middleware/jsonResponse");

const userRoutes = require("./routes/userRoutes");
const userAuthRoutes = require("./routes/userauth");
const categorieRoutes = require("./routes/categorieRoutes");
const productRoutes = require("./routes/productRoutes");
const marketRoutes = require("./routes/marketRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.server.env === "development" ? 1000 : 100,
  message: {
    success: false,
    message: "Trop de requêtes, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.server.env === "development" && req.path.includes("/health");
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.server.env === "development" ? 50 : 5,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
  },
  skipSuccessfulRequests: true,
});
db.sequelize
  .sync({ alter: true }) // Use { force: true } to drop and recreate tables, { alter: true } to update tables
  .then(() => {
    console.log("✅ Database synced!");
    // Start your server here
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });
async function startServer() {
  try {
    const app = express();

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      })
    );

    app.use(compression());

    app.use("/api", limiter);

    app.use("/api/auth", authLimiter);
    app.use(
      cors({
        origin: "http://localhost:5173", // your frontend dev server
        credentials: true, // if you send cookies or auth headers
      })
    );

    // Your routes...
    app.post("/api/cart/add", (req, res) => {
      // handle add to cart
    });

    app.use(
      cors({
        origin: config.server.corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    app.use(jsonResponseMiddleware);

    app.get("/api/health", (req, res) => {
      res.json({
        success: true,
        message: "API is running",
        environment: config.server.env,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    app.get("/api/db-health", async (req, res) => {
      try {
        await testConnection();
        res.json({
          success: true,
          message: "Database connection is healthy",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          message: "Database connection failed",
          error:
            config.server.env === "development" ? error.message : undefined,
        });
      }
    });

    // API Routes
    app.use("/api", userRoutes);
    app.use("/api", userAuthRoutes);
    app.use("/api/categories", categorieRoutes);
    app.use("/api/markets", marketRoutes);
    app.use("/api", productRoutes);
    app.use("/api", orderRoutes);

    app.use("/api", cartRoutes);

    // Error handling middleware (must be last)
    app.use(notFoundHandler);
    app.use(jsonErrorHandler);

    // Test database connection
    await testConnection();

    // Sync database in development
    if (config.server.env === "development") {
      await syncDatabase();
    }

    // Start server
    const server = app.listen(config.server.port, () => {
      console.log(`
🚀 Server running successfully!
📡 Port: ${config.server.port}
🌍 Environment: ${config.server.env}
📊 Health Check: http://localhost:${config.server.port}/api/health
💾 DB Health: http://localhost:${config.server.port}/api/db-health
      `);

      // ✅ Show rate limiting info in development
      if (config.server.env === "development") {
        console.log(`
⚡ Rate Limiting (Development Mode):
   - General API: 1000 requests per 15 minutes
   - Auth endpoints: 50 requests per 15 minutes
        `);
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🔄 SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });

    return app;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception! Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection! Shutting down...", err);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
