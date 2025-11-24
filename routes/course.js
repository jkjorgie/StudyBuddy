// routes/course.js
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course");
const { handleRouteError } = require("./handleError");

// GET /course
router.get("/", async (req, res) => {
  try {
    await courseController.getAllCourses(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// GET /course/:courseId
router.get("/:courseId", async (req, res) => {
  try {
    await courseController.getCourseById(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// POST /course
router.post("/", async (req, res) => {
  try {
    await courseController.createCourse(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// PUT /course/:courseId
router.put("/:courseId", async (req, res) => {
  try {
    await courseController.updateCourse(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// DELETE /course/:courseId
router.delete("/:courseId", async (req, res) => {
  try {
    await courseController.deleteCourse(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

module.exports = router;
