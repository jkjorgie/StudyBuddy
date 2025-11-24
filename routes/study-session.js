// routes/study-session.js
const express = require("express");
const router = express.Router();
const studySessionController = require("../controllers/study-session");
const { handleRouteError } = require("./handleError");

// GET /study-session
router.get("/", async (req, res) => {
  try {
    await studySessionController.getAllStudySessions(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// GET /study-session/:sessionId
router.get("/:sessionId", async (req, res) => {
  try {
    await studySessionController.getStudySessionById(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// POST /study-session
router.post("/", async (req, res) => {
  try {
    await studySessionController.createStudySession(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// PUT /study-session/:sessionId
router.put("/:sessionId", async (req, res) => {
  try {
    await studySessionController.updateStudySession(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

// DELETE /study-session/:sessionId
router.delete("/:sessionId", async (req, res) => {
  try {
    await studySessionController.deleteStudySession(req, res);
  } catch (err) {
    handleRouteError(err, res);
  }
});

module.exports = router;
