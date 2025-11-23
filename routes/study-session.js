// routes/study-session.js
const express = require("express");
const router = express.Router();
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");

// GET /study-session (all sessions)
router.get("/", async (req, res) => {
  try {
    const db = getDatabase().db();
    const sessions = await db.collection("studySessions").find().toArray();
    res.status(200).json(sessions);
  } catch (err) {
    console.error("Error getting study sessions:", err);
    res.status(500).json({ message: "Failed to fetch study sessions" });
  }
});

// GET /study-session/:sessionId (single session)
router.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID" });
  }

  try {
    const db = getDatabase().db();
    const session = await db
      .collection("studySessions")
      .findOne({ _id: new ObjectId(sessionId) });

    if (!session) {
      return res.status(404).json({ message: "Study session not found" });
    }

    res.status(200).json(session);
  } catch (err) {
    console.error("Error getting study session:", err);
    res.status(500).json({ message: "Failed to fetch study session" });
  }
});

// POST /study-session (create session)
router.post("/", async (req, res) => {
  try {
    const {
      courseId,
      length,
      description,
      studySessionRating,
      userId,
    } = req.body;

    if (!courseId || !length) {
      return res
        .status(400)
        .json({ message: "courseId and length are required" });
    }

    const newSession = {
      courseId,
      length,
      description,
      studySessionRating,
      userId,
    };

    const db = getDatabase().db();
    const result = await db.collection("studySessions").insertOne(newSession);

    res.status(201).json({ _id: result.insertedId, ...newSession });
  } catch (err) {
    console.error("Error creating study session:", err);
    res.status(500).json({ message: "Failed to create study session" });
  }
});

// PUT /study-session/:sessionId (update session)
router.put("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID" });
  }

  try {
    const updateDoc = { ...req.body };
    delete updateDoc._id;

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const db = getDatabase().db();
    const result = await db
      .collection("studySessions")
      .updateOne({ _id: new ObjectId(sessionId) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Study session not found" });
    }

    const updatedSession = await db
      .collection("studySessions")
      .findOne({ _id: new ObjectId(sessionId) });

    res.status(200).json(updatedSession);
  } catch (err) {
    console.error("Error updating study session:", err);
    res.status(500).json({ message: "Failed to update study session" });
  }
});

// DELETE /study-session/:sessionId (delete session)
router.delete("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID" });
  }

  try {
    const db = getDatabase().db();
    const result = await db
      .collection("studySessions")
      .deleteOne({ _id: new ObjectId(sessionId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Study session not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting study session:", err);
    res.status(500).json({ message: "Failed to delete study session" });
  }
});

module.exports = router;
