const Task = require("../models/Task");

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { subject, title, duration, date } = req.body;

    const task = await Task.create({
      user: req.user.id,
      subject,
      title,
      duration,
      date
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL TASKS (user wise)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate("subject");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    res.json({ message: "Task deleted ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK COMPLETE
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: "completed" },
      { new: true }
    );

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask
};
