// middleware/jsonResponse.js
/**
 * Middleware to ensure all responses are JSON format
 */
const jsonResponseMiddleware = (req, res, next) => {
  // Store original res.send and res.json methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to always return JSON
  res.send = function (data) {
    res.setHeader("Content-Type", "application/json");

    if (typeof data === "string") {
      try {
        // Try to parse if it's already JSON string
        JSON.parse(data);
        return originalSend.call(this, data);
      } catch (e) {
        // If not valid JSON, wrap it in a JSON object
        return originalSend.call(this, JSON.stringify({ message: data }));
      }
    } else if (typeof data === "object") {
      return originalSend.call(this, JSON.stringify(data));
    } else {
      return originalSend.call(this, JSON.stringify({ data }));
    }
  };

  // Ensure res.json also sets correct headers
  res.json = function (data) {
    res.setHeader("Content-Type", "application/json");
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Global error handler that ensures errors are returned as JSON
 */
const jsonErrorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Set JSON content type
  res.setHeader("Content-Type", "application/json");

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Create error response
  const errorResponse = {
    success: false,
    message: err.message || "Erreur interne du serveur",
    error:
      process.env.NODE_ENV === "development"
        ? {
            stack: err.stack,
            details: err,
          }
        : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler that returns JSON
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
  });
};

module.exports = {
  jsonResponseMiddleware,
  jsonErrorHandler,
  notFoundHandler,
};
