// controllers/study-session.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const {
  createError,
  isValidRating,
  isPositiveNumber,
  sanitizeString,
} = require("./utils");

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
  const { courseId, length, description, studySessionRating, userId } =
    req.body;

  // Validate required fields
  if (!courseId || length === undefined) {
    throw createError(400, "courseId and length are required");
  }

  // Validate courseId format
  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    throw createError(400, "courseId must be a non-empty string");
  }

  // Validate length (in minutes)
  if (typeof length !== "number" || !isPositiveNumber(length)) {
    throw createError(400, "length must be a positive number (minutes)");
  }

  if (length > 1440) {
    // 24 hours in minutes
    throw createError(400, "length cannot exceed 1440 minutes (24 hours)");
  }

  // Validate studySessionRating if provided
  if (studySessionRating !== undefined) {
    if (!isValidRating(studySessionRating)) {
      throw createError(
        400,
        "studySessionRating must be an integer between 1 and 5"
      );
    }
  }

  // Validate description if provided
  if (description !== undefined && typeof description !== "string") {
    throw createError(400, "description must be a string");
  }

  const newSession = {
    courseId: sanitizeString(courseId),
    length,
    description: description ? sanitizeString(description) : undefined,
    studySessionRating,
    userId,
  };

  // Remove undefined fields
  Object.keys(newSession).forEach(
    (key) => newSession[key] === undefined && delete newSession[key]
  );

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

  const { courseId, length, description, studySessionRating, userId } =
    req.body;
  const updateDoc = {};

  // Validate courseId if provided
  if (courseId !== undefined) {
    if (typeof courseId !== "string" || courseId.trim().length === 0) {
      throw createError(400, "courseId must be a non-empty string");
    }
    updateDoc.courseId = sanitizeString(courseId);
  }

  // Validate length if provided
  if (length !== undefined) {
    if (typeof length !== "number" || !isPositiveNumber(length)) {
      throw createError(400, "length must be a positive number (minutes)");
    }
    if (length > 1440) {
      throw createError(400, "length cannot exceed 1440 minutes (24 hours)");
    }
    updateDoc.length = length;
  }

  // Validate studySessionRating if provided
  if (studySessionRating !== undefined) {
    if (!isValidRating(studySessionRating)) {
      throw createError(
        400,
        "studySessionRating must be an integer between 1 and 5"
      );
    }
    updateDoc.studySessionRating = studySessionRating;
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== "string") {
      throw createError(400, "description must be a string");
    }
    updateDoc.description = sanitizeString(description);
  }

  // Add userId if provided
  if (userId !== undefined) {
    updateDoc.userId = userId;
  }

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
