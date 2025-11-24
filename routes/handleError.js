// routes/handleError.js
function handleRouteError(err, res) {
  console.error(err);

  const status =
    typeof err.statusCode === "number" &&
    err.statusCode >= 400 &&
    err.statusCode < 600
      ? err.statusCode
      : 500;

  res.status(status).json({
    message: err.message || "Internal server error",
  });
}

module.exports = { handleRouteError };
