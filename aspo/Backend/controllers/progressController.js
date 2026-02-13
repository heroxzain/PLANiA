const Task = require("../models/Task");

const getProgress = async (req, res) => {
  const userId = req.user._id;

  const completedCount = await Task.countDocuments({
    user: userId,
    status: "completed",
  });

  const missedCount = await Task.countDocuments({
    user: userId,
    status: "missed",
  });

  // subject-wise progress
  const subjectProgress = await Task.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$subject",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        subject: "$_id",
        totalTasks: 1,
        completedTasks: 1,
        progressPercent: {
          $multiply: [
            { $divide: ["$completedTasks", "$totalTasks"] },
            100,
          ],
        },
      },
    },
  ]);

  res.json({
    completedTasks: completedCount,
    missedTasks: missedCount,
    subjectProgress,
  });
};

module.exports = { getProgress };
