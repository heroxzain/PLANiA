const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    },
    completedTasks: Number,
    missedTasks: Number,
    date: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
