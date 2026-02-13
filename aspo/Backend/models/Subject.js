const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🔥 Ab frontend ke mutabiq
    name: {
      type: String,
      required: true,
      trim: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    examDate: {
      type: Date,
      required: true
    },

    // optional agar future me use karna ho
    materials: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Subject", subjectSchema);
