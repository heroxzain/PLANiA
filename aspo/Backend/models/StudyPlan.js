const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    plan: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        minutes: Number,
        difficulty: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
