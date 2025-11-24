// controllers/utils.js

// create an Error with a statusCode field
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = {
  createError,
};
