/**
 * Centralized Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ [API Error]:", err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      message: `Duplicate value entered for ${field}. Please use another unique value.`,
      error: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Mongoose Cast Error (Invalid ID format)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Resource not found or invalid ID format for: ${err.path}`,
    });
  }

  // Multer error
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
