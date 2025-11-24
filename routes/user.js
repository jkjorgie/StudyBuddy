// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { handleRouteError } = require("./handleError");

// GET /user
router.get("/", async (req, res) => {
  try {
    await userController.getAllUsers(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// GET /user/:userId
router.get("/:userId", async (req, res) => {
  try {
    await userController.getUserById(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// POST /user
router.post("/", async (req, res) => {
  try {
    await userController.createUser(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// PUT /user/:userId
router.put("/:userId", async (req, res) => {
  try {
    await userController.updateUser(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// DELETE /user/:userId
router.delete("/:userId", async (req, res) => {
  try {
    await userController.deleteUser(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

module.exports = router;
