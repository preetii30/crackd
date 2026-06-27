export const errorHandler = (error, _req, res, _next) => {
  console.error("Unhandled error:", error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({ message });
};
