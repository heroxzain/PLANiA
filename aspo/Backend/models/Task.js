const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    duration: {
      type: Number, // minutes
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed"],
      default: "pending"
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
