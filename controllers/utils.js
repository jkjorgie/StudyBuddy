// controllers/utils.js

// create an Error with a statusCode field
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date) &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  );
}

// Validate rating (1-5)
function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// Validate positive number
function isPositiveNumber(value) {
  return typeof value === "number" && value > 0;
}

// Validate array
function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

// Sanitize string input
function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str.trim();
}

module.exports = {
  createError,
  isValidEmail,
  isValidDate,
  isValidRating,
  isPositiveNumber,
  isNonEmptyArray,
  sanitizeString,
};
