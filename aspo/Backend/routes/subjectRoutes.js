const express = require("express");
const router = express.Router();

const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject
} = require("../controllers/subjectController");

const protect = require("../middleware/authMiddleware");

// PROTECTED ROUTES
router.post("/", protect, createSubject);
router.get("/", protect, getSubjects);
router.put("/:id", protect, updateSubject);
router.delete("/:id", protect, deleteSubject);

module.exports = router;
