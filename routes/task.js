// routes/task.js
const express = require("express");
const router = express.Router();
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");

// GET /task (all tasks, optional ?userId=...)
router.get("/", async (req, res) => {
  try {
    const db = getDatabase().db();
    const filter = {};

    // This can later be replaced with the authenticated user's id
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const tasks = await db.collection("tasks").find(filter).toArray();
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error getting tasks:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET /task/course/:courseId (tasks for a course)
router.get("/course/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const db = getDatabase().db();
    const tasks = await db
      .collection("tasks")
      .find({ courseId: courseId })
      .toArray(); // courseId kept as string for now

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error getting tasks by course:", err);
    res.status(500).json({ message: "Failed to fetch tasks for course" });
  }
});

// GET /task/:taskId (single task)
router.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const db = getDatabase().db();
    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (err) {
    console.error("Error getting task:", err);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// POST /task (create task)
router.post("/", async (req, res) => {
  try {
    const {
      courseId,
      taskDescription,
      taskDifficultyRating,
      taskTimeEstimate,
      taskTimeActual,
      userId,
    } = req.body;

    if (!courseId || !taskDescription) {
      return res
        .status(400)
        .json({ message: "courseId and taskDescription are required" });
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
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// PUT /task/:taskId (update task)
router.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const updateDoc = { ...req.body };
    delete updateDoc._id;

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const db = getDatabase().db();
    const result = await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(taskId) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) });

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// DELETE /task/:taskId (delete task)
router.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;

  if (!ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const db = getDatabase().db();
    const result = await db
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(taskId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
