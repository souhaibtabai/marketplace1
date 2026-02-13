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
const paymentRoutes = require("./routes/paymentRoutes");

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
    return req.method === 'OPTIONS' || (config.server.env === "development" && req.path.includes("/health"));
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
  skip: (req) => {
    return req.method === 'OPTIONS';
  },
});

async function startServer() {
  try {
    const app = express();

    // Configure CORS to accept multiple origins (must be before other middleware)
    const allowedOrigins = config.server.corsOrigin
      ? config.server.corsOrigin.split(",").map((origin) => origin.trim().replace(/\/$/, ''))
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "https://marketplace-site-a8bm.onrender.com",
          "https://marketplace-dashboard-tfqs.onrender.com",
        ];

    const corsOptions = {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Normalize origin (remove trailing slash)
        const normalizedOrigin = origin.replace(/\/$/, '');
        
        if (allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          // Return null instead of error to send proper CORS rejection
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    // Apply CORS middleware
    app.use(cors(corsOptions));

    // Handle preflight requests explicitly (must be before rate limiters)
    app.options(/.*/, cors(corsOptions));

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
      })
    );

    // Debug logging for CORS headers (only in development or when DEBUG_CORS is enabled)
    if (config.server.env === 'development' || process.env.DEBUG_CORS === 'true') {
      app.use((req, res, next) => {
        const origin = req.get('origin');
        if (origin) {
          console.log(`[CORS] Request from origin: ${origin}, Method: ${req.method}, Path: ${req.path}`);
          res.on('finish', () => {
            const corsHeader = res.get('Access-Control-Allow-Origin');
            console.log(`[CORS] Response ACAO header: ${corsHeader || 'NOT SET'}`);
          });
        }
        next();
      });
    }

    app.use(compression());

    app.use("/api", limiter);

    app.use("/api/auth", authLimiter);

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
    app.use("/api/payments", paymentRoutes);

    // Error handling middleware (must be last)
    app.use(notFoundHandler);
    app.use(jsonErrorHandler);

    // Test database connection with retry logic
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error("❌ Failed to establish database connection. Server will not start.");
      process.exit(1);
    }

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
