export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}
export function errorHandler(err, req, res, _next) {
  let s = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  if (["ValidationError", "CastError", "MulterError"].includes(err.name))
    s = 400;
  if (err.code === 11000) s = 409;
  res
    .status(s)
    .json({
      success: false,
      message: err.message || "Server error",
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    });
}
