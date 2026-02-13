const Task = require("../models/Task");
const Subject = require("../models/Subject");

const getAIDataset = async (req, res) => {
  const userId = req.user._id;

  const subjects = await Subject.find({ user: userId });

  const tasks = await Task.find({ user: userId });

  let subjectData = [];

  for (let subject of subjects) {
    const subjectTasks = tasks.filter(
      t => t.subject.toString() === subject._id.toString()
    );

    const completed = subjectTasks.filter(t => t.status === "completed").length;
    const missed = subjectTasks.filter(t => t.status === "missed").length;

    subjectData.push({
      subjectId: subject._id,
      name: subject.subjectName,
      difficulty: subject.difficulty,
      priority: subject.priority,
      totalTasks: subjectTasks.length,
      completedTasks: completed,
      missedTasks: missed,
      completionRate:
        subjectTasks.length > 0
          ? (completed / subjectTasks.length) * 100
          : 0,
      avgStudyTime: subjectTasks.length * 30 // placeholder
    });
  }

  res.json({
    user: userId,
    date: new Date(),
    subjects: subjectData,
    overall: {
      totalTasks: tasks.length,
      completed: tasks.filter(t => t.status === "completed").length,
      missed: tasks.filter(t => t.status === "missed").length,
      pending: tasks.filter(t => t.status === "pending").length
    }
  });
};

module.exports = { getAIDataset };
