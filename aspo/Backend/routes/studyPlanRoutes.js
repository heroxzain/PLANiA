// ============================================
// STUDY PLAN ROUTES 

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getStudyPlan,
  generateStudyPlan,
  updatePriorities,
  getRecommendations,
  getAnalytics
} = require("../controllers/studyPlanController");

// ============================================
// ALL ROUTES ARE PROTECTED (need login)
// ============================================

// GET current study plan
router.get("/", protect, getStudyPlan);

// POST - Generate AI study plan
router.post("/generate", protect, generateStudyPlan);

// POST - Update priorities based on performance
router.post("/update-priorities", protect, updatePriorities);

// GET - AI recommendations
router.get("/recommendations", protect, getRecommendations);

// GET - Analytics
router.get("/analytics", protect, getAnalytics);

module.exports = router;
