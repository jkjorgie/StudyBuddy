// controllers/user.js
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");
const { createError } = require("./utils");

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

  if (!name || !emailAddress) {
    throw createError(400, "name and emailAddress are required");
  }

  const db = getDatabase().db();
  const newUser = { name, emailAddress };
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

  const updateDoc = {
    ...(name && { name }),
    ...(emailAddress && { emailAddress }),
  };

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
