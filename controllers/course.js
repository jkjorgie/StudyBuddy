// controllers/course.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const { createError } = require("./utils");

// GET /course
exports.getAllCourses = async (req, res) => {
  const db = getDatabase().db();
  const courses = await db.collection("courses").find().toArray();
  res.status(200).json(courses);
};

// GET /course/:courseId
exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    throw createError(400, "Invalid course ID");
  }

  const db = getDatabase().db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw createError(404, "Course not found");
  }

  res.status(200).json(course);
};

// POST /course
exports.createCourse = async (req, res) => {
  const {
    courseName,
    courseDescription,
    courseSchedule,
    instructorName,
    subject,
    startDate,
    endDate,
    userId,
  } = req.body;

  if (!courseName || !startDate || !endDate) {
    throw createError(400, "courseName, startDate, and endDate are required");
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
};

// PUT /course/:courseId
exports.updateCourse = async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    throw createError(400, "Invalid course ID");
  }

  const updateDoc = { ...req.body };
  delete updateDoc._id;

  if (Object.keys(updateDoc).length === 0) {
    throw createError(400, "No valid fields to update");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("courses")
    .updateOne({ _id: new ObjectId(courseId) }, { $set: updateDoc });

  if (result.matchedCount === 0) {
    throw createError(404, "Course not found");
  }

  const updatedCourse = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(courseId) });

  res.status(200).json(updatedCourse);
};

// DELETE /course/:courseId
exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  if (!ObjectId.isValid(courseId)) {
    throw createError(400, "Invalid course ID");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("courses")
    .deleteOne({ _id: new ObjectId(courseId) });

  if (result.deletedCount === 0) {
    throw createError(404, "Course not found");
  }

  res.sendStatus(204);
};
