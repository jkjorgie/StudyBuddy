// routes/task.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task");
const { handleRouteError } = require("./handleError");
const isAuthenticated = require("../middleware/authenticate");

// GET /task
router.get("/", async (req, res) => {
  try {
    await taskController.getAllTasks(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// GET /task/course/:courseId
router.get("/course/:courseId", async (req, res) => {
  try {
    await taskController.getTasksByCourse(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// GET /task/:taskId
router.get("/:taskId", async (req, res) => {
  try {
    await taskController.getTaskById(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// POST /task
router.post("/", isAuthenticated, async (req, res) => {
  try {
    await taskController.createTask(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// PUT /task/:taskId
router.put("/:taskId", isAuthenticated, async (req, res) => {
  try {
    await taskController.updateTask(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// DELETE /task/:taskId
router.delete("/:taskId", isAuthenticated, async (req, res) => {
  try {
    await taskController.deleteTask(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

module.exports = router;
