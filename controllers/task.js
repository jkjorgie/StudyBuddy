// controllers/task.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const {
  createError,
  isValidRating,
  isPositiveNumber,
  sanitizeString,
} = require("./utils");

// GET /task (optionally ?userId=...)
exports.getAllTasks = async (req, res) => {
  const db = getDatabase().db();
  const filter = {};

  if (req.query.userId) {
    filter.userId = req.query.userId;
  }

  const tasks = await db.collection("tasks").find(filter).toArray();
  res.status(200).json(tasks);
};

// GET /task/course/:courseId
exports.getTasksByCourse = async (req, res) => {
  const { courseId } = req.params;
  const db = getDatabase().db();

  const tasks = await db.collection("tasks").find({ courseId }).toArray();
  res.status(200).json(tasks);
};

// GET /task/:taskId
exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    throw createError(400, "Invalid task ID");
  }

  const db = getDatabase().db();
  const task = await db
    .collection("tasks")
    .findOne({ _id: new ObjectId(taskId) });

  if (!task) {
    throw createError(404, "Task not found");
  }

  res.status(200).json(task);
};

// POST /task
exports.createTask = async (req, res) => {
  const {
    courseId,
    taskDescription,
    taskDifficultyRating,
    taskTimeEstimate,
    taskTimeActual,
    userId,
  } = req.body;

  // Validate required fields
  if (!courseId || !taskDescription) {
    throw createError(400, "courseId and taskDescription are required");
  }

  // Validate courseId
  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    throw createError(400, "courseId must be a non-empty string");
  }

  // Validate taskDescription
  if (typeof taskDescription !== "string") {
    throw createError(400, "taskDescription must be a string");
  }

  const sanitizedDescription = sanitizeString(taskDescription);
  if (sanitizedDescription.length < 3 || sanitizedDescription.length > 500) {
    throw createError(
      400,
      "taskDescription must be between 3 and 500 characters"
    );
  }

  // Validate taskDifficultyRating if provided (1-5)
  if (taskDifficultyRating !== undefined) {
    if (!isValidRating(taskDifficultyRating)) {
      throw createError(
        400,
        "taskDifficultyRating must be an integer between 1 and 5"
      );
    }
  }

  // Validate taskTimeEstimate if provided (in minutes)
  if (taskTimeEstimate !== undefined) {
    if (
      typeof taskTimeEstimate !== "number" ||
      !isPositiveNumber(taskTimeEstimate)
    ) {
      throw createError(
        400,
        "taskTimeEstimate must be a positive number (minutes)"
      );
    }
    if (taskTimeEstimate > 10080) {
      // 1 week in minutes
      throw createError(
        400,
        "taskTimeEstimate cannot exceed 10080 minutes (1 week)"
      );
    }
  }

  // Validate taskTimeActual if provided (in minutes)
  if (taskTimeActual !== undefined) {
    if (typeof taskTimeActual !== "number" || taskTimeActual < 0) {
      throw createError(
        400,
        "taskTimeActual must be a non-negative number (minutes)"
      );
    }
    if (taskTimeActual > 10080) {
      throw createError(
        400,
        "taskTimeActual cannot exceed 10080 minutes (1 week)"
      );
    }
  }

  const newTask = {
    courseId: sanitizeString(courseId),
    taskDescription: sanitizedDescription,
    taskDifficultyRating,
    taskTimeEstimate,
    taskTimeActual,
    userId,
  };

  // Remove undefined fields
  Object.keys(newTask).forEach(
    (key) => newTask[key] === undefined && delete newTask[key]
  );

  const db = getDatabase().db();
  const result = await db.collection("tasks").insertOne(newTask);

  res.status(201).json({ _id: result.insertedId, ...newTask });
};

// PUT /task/:taskId
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    throw createError(400, "Invalid task ID");
  }

  const {
    courseId,
    taskDescription,
    taskDifficultyRating,
    taskTimeEstimate,
    taskTimeActual,
    userId,
  } = req.body;
  const updateDoc = {};

  // Validate courseId if provided
  if (courseId !== undefined) {
    if (typeof courseId !== "string" || courseId.trim().length === 0) {
      throw createError(400, "courseId must be a non-empty string");
    }
    updateDoc.courseId = sanitizeString(courseId);
  }

  // Validate taskDescription if provided
  if (taskDescription !== undefined) {
    if (typeof taskDescription !== "string") {
      throw createError(400, "taskDescription must be a string");
    }
    const sanitized = sanitizeString(taskDescription);
    if (sanitized.length < 3 || sanitized.length > 500) {
      throw createError(
        400,
        "taskDescription must be between 3 and 500 characters"
      );
    }
    updateDoc.taskDescription = sanitized;
  }

  // Validate taskDifficultyRating if provided
  if (taskDifficultyRating !== undefined) {
    if (!isValidRating(taskDifficultyRating)) {
      throw createError(
        400,
        "taskDifficultyRating must be an integer between 1 and 5"
      );
    }
    updateDoc.taskDifficultyRating = taskDifficultyRating;
  }

  // Validate taskTimeEstimate if provided
  if (taskTimeEstimate !== undefined) {
    if (
      typeof taskTimeEstimate !== "number" ||
      !isPositiveNumber(taskTimeEstimate)
    ) {
      throw createError(
        400,
        "taskTimeEstimate must be a positive number (minutes)"
      );
    }
    if (taskTimeEstimate > 10080) {
      throw createError(
        400,
        "taskTimeEstimate cannot exceed 10080 minutes (1 week)"
      );
    }
    updateDoc.taskTimeEstimate = taskTimeEstimate;
  }

  // Validate taskTimeActual if provided
  if (taskTimeActual !== undefined) {
    if (typeof taskTimeActual !== "number" || taskTimeActual < 0) {
      throw createError(
        400,
        "taskTimeActual must be a non-negative number (minutes)"
      );
    }
    if (taskTimeActual > 10080) {
      throw createError(
        400,
        "taskTimeActual cannot exceed 10080 minutes (1 week)"
      );
    }
    updateDoc.taskTimeActual = taskTimeActual;
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
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId) }, { $set: updateDoc });

  if (result.matchedCount === 0) {
    throw createError(404, "Task not found");
  }

  const updatedTask = await db
    .collection("tasks")
    .findOne({ _id: new ObjectId(taskId) });

  res.status(200).json(updatedTask);
};

// DELETE /task/:taskId
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    throw createError(400, "Invalid task ID");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("tasks")
    .deleteOne({ _id: new ObjectId(taskId) });

  if (result.deletedCount === 0) {
    throw createError(404, "Task not found");
  }

  res.sendStatus(204);
};
