// controllers/user.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const { createError, isValidEmail, sanitizeString } = require("./utils");

// GET /user
exports.getAllUsers = async (req, res) => {
  const db = getDatabase().db();
  const users = await db.collection("users").find().toArray();
  res.status(200).json(users);
};

// GET /user/:userId
exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    throw createError(400, "Invalid user ID");
  }

  const db = getDatabase().db();
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw createError(404, "User not found");
  }

  res.status(200).json(user);
};

// POST /user
exports.createUser = async (req, res) => {
  const { name, emailAddress } = req.body;

  // Validate required fields
  if (!name || !emailAddress) {
    throw createError(400, "name and emailAddress are required");
  }

  // Validate data types
  if (typeof name !== "string" || typeof emailAddress !== "string") {
    throw createError(400, "name and emailAddress must be strings");
  }

  // Sanitize inputs
  const sanitizedName = sanitizeString(name);
  const sanitizedEmail = sanitizeString(emailAddress);

  // Validate name length
  if (sanitizedName.length < 2 || sanitizedName.length > 100) {
    throw createError(400, "name must be between 2 and 100 characters");
  }

  // Validate email format
  if (!isValidEmail(sanitizedEmail)) {
    throw createError(400, "Invalid email address format");
  }

  const db = getDatabase().db();

  // Check for duplicate email
  const existingUser = await db
    .collection("users")
    .findOne({ emailAddress: sanitizedEmail });
  if (existingUser) {
    throw createError(409, "User with this email already exists");
  }

  const newUser = { name: sanitizedName, emailAddress: sanitizedEmail };
  const result = await db.collection("users").insertOne(newUser);

  res.status(201).json({ _id: result.insertedId, ...newUser });
};

// PUT /user/:userId
exports.updateUser = async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    throw createError(400, "Invalid user ID");
  }

  const { name, emailAddress } = req.body;

  const updateDoc = {};

  // Validate and add name if provided
  if (name !== undefined) {
    if (typeof name !== "string") {
      throw createError(400, "name must be a string");
    }
    const sanitizedName = sanitizeString(name);
    if (sanitizedName.length < 2 || sanitizedName.length > 100) {
      throw createError(400, "name must be between 2 and 100 characters");
    }
    updateDoc.name = sanitizedName;
  }

  // Validate and add email if provided
  if (emailAddress !== undefined) {
    if (typeof emailAddress !== "string") {
      throw createError(400, "emailAddress must be a string");
    }
    const sanitizedEmail = sanitizeString(emailAddress);
    if (!isValidEmail(sanitizedEmail)) {
      throw createError(400, "Invalid email address format");
    }

    const db = getDatabase().db();
    // Check for duplicate email (excluding current user)
    const existingUser = await db.collection("users").findOne({
      emailAddress: sanitizedEmail,
      _id: { $ne: new ObjectId(userId) },
    });
    if (existingUser) {
      throw createError(409, "User with this email already exists");
    }
    updateDoc.emailAddress = sanitizedEmail;
  }

  if (Object.keys(updateDoc).length === 0) {
    throw createError(400, "No valid fields to update");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: updateDoc });

  if (result.matchedCount === 0) {
    throw createError(404, "User not found");
  }

  const updatedUser = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  res.status(200).json(updatedUser);
};

// DELETE /user/:userId
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    throw createError(400, "Invalid user ID");
  }

  const db = getDatabase().db();
  const result = await db
    .collection("users")
    .deleteOne({ _id: new ObjectId(userId) });

  if (result.deletedCount === 0) {
    throw createError(404, "User not found");
  }

  res.sendStatus(204);
};
