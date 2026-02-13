const mongoose = require("mongoose");

const aiDatasetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    input: Object,   // subjects, difficulty, time
    output: Object,  // plan, recommendations
    accuracy: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIDataset", aiDatasetSchema);
