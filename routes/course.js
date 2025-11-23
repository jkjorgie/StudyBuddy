// routes/course.js
const express = require("express");
const router = express.Router();
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");

// GET /course (all courses)
router.get("/", async (req, res) => {
  try {
    const db = getDatabase().db();
    const courses = await db.collection("courses").find().toArray();
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error getting courses:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// GET /course/:courseId (single course)
router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const db = getDatabase().db();
    const course = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(courseId) });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error getting course:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

// POST /course (create course)
router.post("/", async (req, res) => {
  try {
    const {
      courseName,
      courseDescription,
      courseSchedule,
      instructorName,
      subject,
      startDate,
      endDate,
    } = req.body;

    if (!courseName || !startDate || !endDate) {
      return res.status(400).json({
        message: "courseName, startDate, and endDate are required",
      });
    }

    const newCourse = {
      courseName,
      courseDescription,
      courseSchedule,
      instructorName,
      subject,
      startDate,
      endDate,
      userId,
    };

    const db = getDatabase().db();
    const result = await db.collection("courses").insertOne(newCourse);

    res.status(201).json({ _id: result.insertedId, ...newCourse });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ message: "Failed to create course" });
  }
});

// PUT /course/:courseId (update course)
router.put("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const updateDoc = { ...req.body };
    delete updateDoc._id;

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const db = getDatabase().db();
    const result = await db
      .collection("courses")
      .updateOne({ _id: new ObjectId(courseId) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const updatedCourse = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(courseId) });

    res.status(200).json(updatedCourse);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ message: "Failed to update course" });
  }
});

// DELETE /course/:courseId (delete course)
router.delete("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const db = getDatabase().db();
    const result = await db
      .collection("courses")
      .deleteOne({ _id: new ObjectId(courseId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

module.exports = router;
