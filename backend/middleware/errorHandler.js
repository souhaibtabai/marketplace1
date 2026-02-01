// middleware/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleDatabaseError = (error) => {
  if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((err) => err.message);
    return new AppError(`Erreurs de validation: ${errors.join(". ")}`, 400);
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    const field = Object.keys(error.fields)[0];
    return new AppError(`${field} déjà utilisé`, 409);
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return new AppError("Référence invalide", 400);
  }

  return new AppError("Erreur de base de données", 500);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error("ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Quelque chose s'est mal passé!",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError" ||
      err.name === "SequelizeForeignKeyConstraintError"
    ) {
      error = handleDatabaseError(err);
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsync,
};
