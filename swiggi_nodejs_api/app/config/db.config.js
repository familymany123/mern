require("dotenv").config();

const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
