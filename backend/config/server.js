const express = require("express");
const cors = require("cors");
const config = require("./environment");

function createServer() {
  const app = express();
  
  const allowedOrigins = config.server.corsOrigin
    ? config.server.corsOrigin.split(",").map((origin) => origin.trim())
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://marketplace-site-a8bm.onrender.com",
        "https://marketplace-dashboard-tfqs.onrender.com",
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      environment: config.server.env,
    });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Une erreur serveur est survenue",
      error: config.server.env === "development" ? err.message : {},
    });
  });

  return app;
}

module.exports = { createServer, config };
