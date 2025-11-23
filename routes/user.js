// routes/user.js
const express = require("express");
const router = express.Router();
const { getDatabase } = require("../data/database");
const { ObjectId } = require("mongodb");

// GET /user (all users)
router.get("/", async (req, res) => {
  try {
    const db = getDatabase().db();
    const users = await db.collection("users").find().toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error getting users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /user/:userId (single user)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const db = getDatabase().db();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error getting user:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// POST /user (create user)
router.post("/", async (req, res) => {
  try {
    const { name, emailAddress } = req.body;

    if (!name || !emailAddress) {
      return res
        .status(400)
        .json({ message: "name and emailAddress are required" });
    }

    const db = getDatabase().db();
    const newUser = { name, emailAddress };
    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({ _id: result.insertedId, ...newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// PUT /user/:userId (update user)
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const { name, emailAddress } = req.body;

    const updateDoc = {
      ...(name && { name }),
      ...(emailAddress && { emailAddress }),
    };

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const db = getDatabase().db();
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /user/:userId (delete user)
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const db = getDatabase().db();
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;

