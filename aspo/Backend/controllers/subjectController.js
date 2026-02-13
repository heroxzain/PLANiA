const Subject = require("../models/Subject");

// ================= CREATE SUBJECT =================
const createSubject = async (req, res) => {
  try {
    const { name, difficulty, examDate, materials } = req.body;

    if (!name || !examDate) {
      return res.status(400).json({
        message: "name & examDate are required",
      });
    }

    const subject = await Subject.create({
      user: req.user._id, // JWT middleware se aata hai
      name,
      difficulty,
      examDate,
      materials: materials || [],
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL SUBJECTS =================
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      user: req.user._id,
    }).sort({ examDate: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE SUBJECT =================
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE SUBJECT =================
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
};
