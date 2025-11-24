// controllers/task.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const { createError } = require("./utils");

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

  if (!courseId || !taskDescription) {
    throw createError(400, "courseId and taskDescription are required");
  }

  const newTask = {
    courseId,
    taskDescription,
    taskDifficultyRating,
    taskTimeEstimate,
    taskTimeActual,
    userId,
  };

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

  const updateDoc = { ...req.body };
  delete updateDoc._id;

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
