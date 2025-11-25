// controllers/course.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const {
  createError,
  isValidDate,
  isNonEmptyArray,
  sanitizeString,
} = require("./utils");

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

  // Validate required fields
  if (!courseName || !startDate || !endDate) {
    throw createError(400, "courseName, startDate, and endDate are required");
  }

  // Validate data types
  if (typeof courseName !== "string") {
    throw createError(400, "courseName must be a string");
  }

  // Sanitize strings
  const sanitizedCourseName = sanitizeString(courseName);
  if (sanitizedCourseName.length < 2 || sanitizedCourseName.length > 200) {
    throw createError(400, "courseName must be between 2 and 200 characters");
  }

  // Validate dates
  if (!isValidDate(startDate)) {
    throw createError(
      400,
      "startDate must be a valid date in YYYY-MM-DD format"
    );
  }
  if (!isValidDate(endDate)) {
    throw createError(400, "endDate must be a valid date in YYYY-MM-DD format");
  }

  // Validate date logic
  if (new Date(startDate) >= new Date(endDate)) {
    throw createError(400, "endDate must be after startDate");
  }

  // Validate courseSchedule if provided
  if (courseSchedule !== undefined) {
    if (!isNonEmptyArray(courseSchedule)) {
      throw createError(400, "courseSchedule must be a non-empty array");
    }
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    for (const day of courseSchedule) {
      if (!validDays.includes(day)) {
        throw createError(400, `Invalid day in courseSchedule: ${day}`);
      }
    }
  }

  const newCourse = {
    courseName: sanitizedCourseName,
    courseDescription: courseDescription
      ? sanitizeString(courseDescription)
      : undefined,
    courseSchedule,
    instructorName: instructorName ? sanitizeString(instructorName) : undefined,
    subject: subject ? sanitizeString(subject) : undefined,
    startDate,
    endDate,
    userId,
  };

  // Remove undefined fields
  Object.keys(newCourse).forEach(
    (key) => newCourse[key] === undefined && delete newCourse[key]
  );

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
  const updateDoc = {};

  // Validate and add courseName if provided
  if (courseName !== undefined) {
    if (typeof courseName !== "string") {
      throw createError(400, "courseName must be a string");
    }
    const sanitized = sanitizeString(courseName);
    if (sanitized.length < 2 || sanitized.length > 200) {
      throw createError(400, "courseName must be between 2 and 200 characters");
    }
    updateDoc.courseName = sanitized;
  }

  // Validate dates if provided
  if (startDate !== undefined) {
    if (!isValidDate(startDate)) {
      throw createError(
        400,
        "startDate must be a valid date in YYYY-MM-DD format"
      );
    }
    updateDoc.startDate = startDate;
  }

  if (endDate !== undefined) {
    if (!isValidDate(endDate)) {
      throw createError(
        400,
        "endDate must be a valid date in YYYY-MM-DD format"
      );
    }
    updateDoc.endDate = endDate;
  }

  // Validate date logic if both are being updated
  if (updateDoc.startDate && updateDoc.endDate) {
    if (new Date(updateDoc.startDate) >= new Date(updateDoc.endDate)) {
      throw createError(400, "endDate must be after startDate");
    }
  }

  // Validate courseSchedule if provided
  if (courseSchedule !== undefined) {
    if (!isNonEmptyArray(courseSchedule)) {
      throw createError(400, "courseSchedule must be a non-empty array");
    }
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    for (const day of courseSchedule) {
      if (!validDays.includes(day)) {
        throw createError(400, `Invalid day in courseSchedule: ${day}`);
      }
    }
    updateDoc.courseSchedule = courseSchedule;
  }

  // Add other optional fields with sanitization
  if (courseDescription !== undefined)
    updateDoc.courseDescription = sanitizeString(courseDescription);
  if (instructorName !== undefined)
    updateDoc.instructorName = sanitizeString(instructorName);
  if (subject !== undefined) updateDoc.subject = sanitizeString(subject);
  if (userId !== undefined) updateDoc.userId = userId;

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
