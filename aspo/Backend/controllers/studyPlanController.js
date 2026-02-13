// ============================================
// STUDY PLAN CONTROLLER 
// ============================================
// This is the controller for studyPlanRoutes.js
// Uses AIStudyPlanner to generate intelligent study plans

const Subject = require("../models/Subject");
const Task = require("../models/Task");
const StudyPlan = require("../models/StudyPlan");
const AIStudyPlanner = require("../utils/aiPlanner");

// ============================================
// @desc    Generate AI-powered study plan
// @route   POST /api/study-plan/generate
// @access  Private
// ============================================
const generateStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dailyMinutes = 240 } = req.body; // Default 4 hours
    
    // 1. Get user's subjects
    const subjects = await Subject.find({ user: userId });
    
    if (subjects.length === 0) {
      return res.status(400).json({ 
        message: "Please add subjects first!" 
      });
    }

    // 2. Delete existing data from the database
    await StudyPlan.deleteMany({ user: userId });
    await Task.deleteMany({ user: userId });
    
    // 3. Generate AI study plan (7 days)
    const studyPlanData = AIStudyPlanner.generateStudyPlan(subjects, dailyMinutes);
    
    // 4. Save study plans to database
    const savedPlans = [];
    for (const dayPlan of studyPlanData) {
      const plan = new StudyPlan({
        user: userId,
        date: dayPlan.date,
        plan: dayPlan.plan
      });
      await plan.save();
      savedPlans.push(plan);
    }
    
    // 5. Generate tasks from study plan
    const tasks = AIStudyPlanner.generateTasks(studyPlanData, userId);
    
    // 6. Save tasks to database
    const savedTasks = [];
    for (const taskData of tasks) {
      const task = new Task(taskData);
      await task.save();
      savedTasks.push(task);
    }
    
    // 7. Add revision tasks for upcoming exams
    let revisionTasks = [];
    for (const subject of subjects) {
      const daysUntilExam = Math.ceil(
        (new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      // Add revision if exam is within 14 days
      if (daysUntilExam > 0 && daysUntilExam <= 14) {
        const revTasks = AIStudyPlanner.generateRevisionTasks(subject, userId);
        
        for (const revTaskData of revTasks) {
          const task = new Task(revTaskData);
          await task.save();
          revisionTasks.push(task);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: "New AI Study Plan Generated Successfully! 🎉",
      data: {
        studyPlans: savedPlans.length,
        tasksCreated: savedTasks.length,
        revisionTasks: revisionTasks.length,
        totalTasks: savedTasks.length + revisionTasks.length
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: "Error generating study plan",
      error: error.message 
    });
  }
};

// ============================================
// @desc    Get study plan (existing function)
// @route   GET /api/study-plan
// @access  Private
// ============================================
const getStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get study plans for next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const studyPlans = await StudyPlan.find({
      user: userId,
      date: { $gte: today, $lte: sevenDaysLater }
    })
    .populate('plan.subject', 'name difficulty')
    .sort({ date: 1 });
    
    res.json({
      success: true,
      count: studyPlans.length,
      data: studyPlans
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ============================================
// @desc    Update priorities based on performance
// @route   POST /api/study-plan/update-priorities
// @access  Private
// ============================================
const updatePriorities = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Use AI to update priorities
    await AIStudyPlanner.updateSubjectPriorities(userId, Subject, Task);
    
    // Get updated subjects
    const subjects = await Subject.find({ user: userId });
    
    res.json({
      success: true,
      message: "Priorities updated based on your performance! 📊",
      data: subjects
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ============================================
// @desc    Get AI recommendations
// @route   GET /api/study-plan/recommendations
// @access  Private
// ============================================
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subjects = await Subject.find({ user: userId });
    const tasks = await Task.find({ user: userId }).populate('subject');
    
    const recommendations = AIStudyPlanner.getRecommendations(subjects, tasks);
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ============================================
// @desc    Get analytics
// @route   GET /api/study-plan/analytics
// @access  Private
// ============================================
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subjects = await Subject.find({ user: userId });
    const tasks = await Task.find({ user: userId }).populate('subject');
    
    const analytics = AIStudyPlanner.getAnalytics(subjects, tasks);
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getStudyPlan,
  generateStudyPlan,
  updatePriorities,
  getRecommendations,
  getAnalytics
};
