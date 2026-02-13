// ============================================
// MEMBER 3: AI STUDY PLANNER
// ============================================
// Created to work with YOUR backend models:
// - Subject: { subjectName, difficulty, priority, examDate }
// - Task: { subject, title, duration, status, date }
// - StudyPlan: { date, plan: [{ subject, minutes, difficulty }] }
// ============================================

class AIStudyPlanner {
  
  // ============================================
  // FUNCTION 1: Calculate Priority for Subject
  // ============================================
  static calculatePriority(subject) {
    const daysLeft = Math.ceil(
      (new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    // Convert difficulty string to number
    const difficultyMap = { easy: 3, medium: 6, hard: 9 };
    const difficultyScore = difficultyMap[subject.difficulty] || 6;
    
    // Priority calculation
    // 40% difficulty + 60% urgency
    const difficultyWeight = difficultyScore * 0.4;
    const urgencyWeight = Math.max(0, (30 - daysLeft) / 30 * 10 * 0.6);
    
    const priority = Math.min(10, difficultyWeight + urgencyWeight);
    
    return Math.round(priority * 10) / 10;
  }

  // ============================================
  // FUNCTION 2: Allocate Study Time
  // ============================================
  static allocateStudyTime(subjects, dailyMinutes = 240) {
    // Calculate total priority
    let totalPriority = 0;
    subjects.forEach(subject => {
      totalPriority += this.calculatePriority(subject);
    });
    
    // Allocate time proportionally
    const allocation = subjects.map(subject => {
      const priority = this.calculatePriority(subject);
      const percentage = priority / totalPriority;
      const minutes = Math.round(dailyMinutes * percentage);
      
      return {
        subject: subject._id,
        subjectName: subject.name,
        difficulty: subject.difficulty,
        minutes: minutes,
        priority: priority
      };
    });
    
    return allocation.sort((a, b) => b.priority - a.priority);
  }

  // ============================================
  // FUNCTION 3: Generate Study Plan (7 Days)
  // ============================================
  static generateStudyPlan(subjects, dailyMinutes = 240) {
    const plan = [];
    const allocation = this.allocateStudyTime(subjects, dailyMinutes);
    
    // Generate for 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);
      
      // Create plan for this day
      const dayPlan = allocation.map(item => ({
        subject: item.subject,
        minutes: item.minutes,
        difficulty: item.difficulty
      }));
      
      plan.push({
        date: date,
        plan: dayPlan
      });
    }
    
    return plan;
  }

  // ============================================
  // FUNCTION 4: Generate Tasks from Study Plan
  // ============================================
  static generateTasks(studyPlan, userId) {
    const tasks = [];
    
    studyPlan.forEach(dayPlan => {
      dayPlan.plan.forEach(item => {
        // Skip if less than 30 minutes
        if (item.minutes < 30) return;
        
        tasks.push({
          user: userId,
          subject: item.subject,
          title: `Study Session`,
          duration: item.minutes,
          status: 'pending',
          date: dayPlan.date
        });
      });
    });
    
    return tasks;
  }

  // ============================================
  // FUNCTION 5: Update Priorities Based on Performance
  // ============================================
  static async updateSubjectPriorities(userId, Subject, Task) {
    try {
      const subjects = await Subject.find({ user: userId });
      
      for (const subject of subjects) {
        // Get tasks for this subject
        const tasks = await Task.find({ 
          user: userId, 
          subject: subject._id 
        });
        
        if (tasks.length === 0) continue;
        
        // Calculate performance
        const completed = tasks.filter(t => t.status === 'completed').length;
        const missed = tasks.filter(t => t.status === 'missed').length;
        const completionRate = completed / tasks.length;
        
        // Update priority based on performance
        if (completionRate < 0.5 || missed > 3) {
          // Poor performance - increase priority
          subject.priority = Math.min(10, subject.priority + 2);
        } else if (completionRate > 0.8) {
          // Good performance - normalize priority
          subject.priority = this.calculatePriority(subject);
        }
        
        await subject.save();
      }
      
      return true;
    } catch (error) {
      console.error('Error updating priorities:', error);
      return false;
    }
  }

  // ============================================
  // FUNCTION 6: Generate Revision Tasks
  // ============================================
  static generateRevisionTasks(subject, userId, daysBeforeExam = 7) {
    const revisionTasks = [];
    const examDate = new Date(subject.examDate);
    
    // Generate revision tasks for last 7 days
    for (let day = daysBeforeExam; day > 0; day--) {
      const revisionDate = new Date(examDate);
      revisionDate.setDate(revisionDate.getDate() - day);
      revisionDate.setHours(0, 0, 0, 0);
      
      revisionTasks.push({
        user: userId,
        subject: subject._id,
        title: `Revision - ${subject.name}`,
        duration: 90,
        status: 'pending',
        date: revisionDate
      });
    }
    
    // Mock test 2 days before exam
    const mockTestDate = new Date(examDate);
    mockTestDate.setDate(mockTestDate.getDate() - 2);
    mockTestDate.setHours(0, 0, 0, 0);
    
    revisionTasks.push({
      user: userId,
      subject: subject._id,
      title: `Mock Test - ${subject.name}`,
      duration: 120,
      status: 'pending',
      date: mockTestDate
    });
    
    return revisionTasks;
  }

  // ============================================
  // FUNCTION 7: Get Study Recommendations
  // ============================================
  static getRecommendations(subjects, tasks) {
    const recommendations = [];
    
    subjects.forEach(subject => {
      const subjectTasks = tasks.filter(
        t => t.subject.toString() === subject._id.toString()
      );
      
      if (subjectTasks.length === 0) {
        recommendations.push({
          subject: subject.name,
          message: 'No tasks scheduled yet. Create a study plan!',
          priority: 'high'
        });
        return;
      }
      
      const completed = subjectTasks.filter(t => t.status === 'completed').length;
      const missed = subjectTasks.filter(t => t.status === 'missed').length;
      const pending = subjectTasks.filter(t => t.status === 'pending').length;
      
      // Check for missed tasks
      if (missed > 3) {
        recommendations.push({
          subject: subject.name,
          message: `You've missed ${missed} tasks. Need to focus more!`,
          priority: 'urgent'
        });
      }
      
      // Check exam approaching
      const daysLeft = Math.ceil(
        (new Date(subject.examDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysLeft <= 7 && daysLeft > 0) {
        recommendations.push({
          subject: subject.name,
          message: `Exam in ${daysLeft} days! Start revision now.`,
          priority: 'urgent'
        });
      }
      
      // Check good performance
      if (completed > 5 && missed === 0) {
        recommendations.push({
          subject: subject.name,
          message: 'Great job! Keep up the good work! 🎉',
          priority: 'low'
        });
      }
    });
    
    return recommendations;
  }

  // ============================================
  // FUNCTION 8: Get Analytics Data
  // ============================================
  static getAnalytics(subjects, tasks) {
    const analytics = {
      totalSubjects: subjects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      missedTasks: tasks.filter(t => t.status === 'missed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      completionRate: 0,
      totalStudyMinutes: 0,
      subjectBreakdown: []
    };
    
    // Calculate completion rate
    if (tasks.length > 0) {
      analytics.completionRate = Math.round(
        (analytics.completedTasks / tasks.length) * 100
      );
    }
    
    // Calculate total study time (completed tasks only)
    analytics.totalStudyMinutes = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.duration, 0);
    
    // Subject-wise breakdown
    subjects.forEach(subject => {
      const subjectTasks = tasks.filter(
        t => t.subject.toString() === subject._id.toString()
      );
      
      const completed = subjectTasks.filter(t => t.status === 'completed').length;
      const total = subjectTasks.length;
      
      analytics.subjectBreakdown.push({
        subjectName: subject.name,
        difficulty: subject.difficulty,
        totalTasks: total,
        completedTasks: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        studyMinutes: subjectTasks
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.duration, 0)
      });
    });
    
    return analytics;
  }
}

module.exports = AIStudyPlanner;
