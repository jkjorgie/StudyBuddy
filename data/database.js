//data/database.js
const dotenv = require("dotenv");
dotenv.config();

const MongoClient = require("mongodb").MongoClient;

let database;

const initDb = (callback) => {
  if (database) {
    console.log("Database is already initialized!");
    return callback(null, database);
  }
  MongoClient.connect(process.env.MONGODB_URL)
    .then((client) => {
      database = client;
      callback(null, database);
    })
    .catch((err) => {
      callback(err);
    });
};

const getDatabase = () => {
  if (!database) {
    throw new Error("Database not initialized");
  }
  return database;
};

const pingDatabase = async () => {
  try {
    if (!database) {
      throw new Error("Database not initialized. Call initDb first.");
    }

    console.log("Pinging database...");

    // Ping the database to verify connection
    const pingResult = await database.db().admin().ping();
    console.log("Database ping successful:", pingResult);

    // Check if users collection exists and is accessible
    const db = database.db();
    const collections = await db.listCollections({ name: "users" }).toArray();

    if (collections.length > 0) {
      console.log("Users collection found and accessible");
    } else {
      console.log(
        "Users collection not found (will be created on first insert)"
      );
    }

    // Try to count documents in users collection
    const count = await db.collection("users").countDocuments();
    console.log(`Users collection has ${count} document(s)`);

    return true;
  } catch (err) {
    console.error("Database ping failed:", err.message);
    return false;
  }
};

module.exports = {
  initDb,
  getDatabase,
  pingDatabase,
};
