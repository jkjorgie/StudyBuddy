// controllers/study-session.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const { createError } = require("./utils");

// GET /study-session
exports.getAllStudySessions = async (req, res) => {
  const db = getDatabase().db();
  const sessions = await db.collection("study_sessions").find().toArray();
  res.status(200).json(sessions);
};

// GET /study-session/:sessionId
exports.getStudySessionById = async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    throw createError(400, "Invalid session ID");
  }

  const db = getDatabase().db();
  const session = await db
    .collection("study_sessions")
    .findOne({ _id: new ObjectId(sessionId) });

  if (!session) {
    throw createError(404, "Study session not found");
  }

  res.status(200).json(session);
};

// POST /study-session
exports.createStudySession = async (req, res) => {
  const { courseId, length, description, studySessionRating, userId } = req.body;

  if (!courseId || !length) {
    throw createError(400, "courseId and length are required");
  }

  const newSession = {
    courseId,
    length,
    description,
    studySessionRating,
    userId,
  };

  const db = getDatabase().db();
  const result = await db.collection("study_sessions").insertOne(newSession);

  res.status(201).json({ _id: result.insertedId, ...newSession });
};

// PUT /study-session/:sessionId
exports.updateStudySession = async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    throw createError(400, "Invalid session ID");
  }

  const updateDoc = { ...req.body };
  delete updateDoc._id;

  if (Object.keys(updateDoc).length === 0) {
    throw createError(400, "No valid fields to update");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("study_sessions")
    .updateOne({ _id: new ObjectId(sessionId) }, { $set: updateDoc });

  if (result.matchedCount === 0) {
    throw createError(404, "Study session not found");
  }

  const updatedSession = await db
    .collection("study_sessions")
    .findOne({ _id: new ObjectId(sessionId) });

  res.status(200).json(updatedSession);
};

// DELETE /study-session/:sessionId
exports.deleteStudySession = async (req, res) => {
  const { sessionId } = req.params;

  if (!ObjectId.isValid(sessionId)) {
    throw createError(400, "Invalid session ID");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("study_sessions")
    .deleteOne({ _id: new ObjectId(sessionId) });

  if (result.deletedCount === 0) {
    throw createError(404, "Study session not found");
  }

  res.sendStatus(204);
};
