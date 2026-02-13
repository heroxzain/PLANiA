const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/plania';
    await mongoose.connect(connStr);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Silent fail for demo if no Mongo
  }
};

module.exports = connectDB;
