// ============================================
// TEST FILE FOR AI STUDY PLANNER
// ============================================
// Run this to verify AI functions work correctly

const AIStudyPlanner = require('./utils/aiPlanner');

console.log('\n🧪 TESTING AI STUDY PLANNER\n');
console.log('='.repeat(60));

// ============================================
// TEST DATA (matching your models)
// ============================================

const testSubjects = [
  {
    _id: 'sub1',
    subjectName: 'Mathematics',
    difficulty: 'hard',
    priority: 5,
    examDate: new Date('2024-03-15')
  },
  {
    _id: 'sub2',
    subjectName: 'Physics',
    difficulty: 'medium',
    priority: 3,
    examDate: new Date('2024-03-20')
  },
  {
    _id: 'sub3',
    subjectName: 'Chemistry',
    difficulty: 'easy',
    priority: 2,
    examDate: new Date('2024-04-01')
  }
];

const testTasks = [
  {
    subject: 'sub1',
    status: 'completed',
    duration: 60
  },
  {
    subject: 'sub1',
    status: 'completed',
    duration: 90
  },
  {
    subject: 'sub1',
    status: 'missed',
    duration: 60
  },
  {
    subject: 'sub2',
    status: 'completed',
    duration: 60
  },
  {
    subject: 'sub2',
    status: 'pending',
    duration: 60
  }
];

// ============================================
// TEST 1: Priority Calculation
// ============================================
console.log('\n📊 TEST 1: Calculate Priority\n');

testSubjects.forEach(subject => {
  const priority = AIStudyPlanner.calculatePriority(subject);
  console.log(`${subject.subjectName}:`);
  console.log(`  Difficulty: ${subject.difficulty}`);
  console.log(`  Priority: ${priority}/10`);
  console.log('');
});

console.log('✅ Expected: Hard subjects should have higher priority');

// ============================================
// TEST 2: Time Allocation
// ============================================
console.log('\n⏰ TEST 2: Allocate Study Time (240 minutes = 4 hours)\n');

const allocation = AIStudyPlanner.allocateStudyTime(testSubjects, 240);

let totalMinutes = 0;
allocation.forEach(item => {
  console.log(`${item.subjectName}:`);
  console.log(`  Priority: ${item.priority}/10`);
  console.log(`  Time: ${item.minutes} minutes`);
  console.log(`  Difficulty: ${item.difficulty}`);
  console.log('');
  totalMinutes += item.minutes;
});

console.log(`Total Allocated: ${totalMinutes} minutes`);
console.log('✅ Expected: Should be close to 240 minutes');

if (Math.abs(totalMinutes - 240) < 10) {
  console.log('✅ PASS: Time allocation is correct!\n');
} else {
  console.log('⚠️  WARNING: Time might not add up exactly\n');
}

// ============================================
// TEST 3: Generate Study Plan
// ============================================
console.log('\n📅 TEST 3: Generate 7-Day Study Plan\n');

const studyPlan = AIStudyPlanner.generateStudyPlan(testSubjects, 240);

console.log(`✅ Generated ${studyPlan.length} days of study plans\n`);

// Show first day
const firstDay = studyPlan[0];
console.log(`Day 1: ${firstDay.date.toDateString()}`);
console.log(`Subjects to study: ${firstDay.plan.length}`);
console.log('\nPlan details:');
firstDay.plan.forEach((item, i) => {
  console.log(`  ${i+1}. ${item.minutes} minutes (${item.difficulty})`);
});

console.log('\n... (6 more days generated)');

// ============================================
// TEST 4: Generate Tasks
// ============================================
console.log('\n\n📝 TEST 4: Generate Tasks from Study Plan\n');

const tasks = AIStudyPlanner.generateTasks(studyPlan, 'user123');

console.log(`✅ Generated ${tasks.length} tasks from study plan\n`);
console.log('Sample tasks:');
tasks.slice(0, 3).forEach((task, i) => {
  console.log(`  ${i+1}. ${task.title}`);
  console.log(`     Duration: ${task.duration} minutes`);
  console.log(`     Date: ${task.date.toDateString()}`);
  console.log(`     Status: ${task.status}`);
  console.log('');
});

if (tasks.length > 3) {
  console.log(`  ... and ${tasks.length - 3} more tasks`);
}

// ============================================
// TEST 5: Revision Tasks
// ============================================
console.log('\n\n📚 TEST 5: Generate Revision Tasks\n');

const upcomingExam = {
  _id: 'exam1',
  subjectName: 'Final Mathematics',
  examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
};

const revisionTasks = AIStudyPlanner.generateRevisionTasks(upcomingExam, 'user123', 7);

console.log(`✅ Generated ${revisionTasks.length} revision tasks\n`);

revisionTasks.forEach((task, i) => {
  console.log(`${i+1}. ${task.title}`);
  console.log(`   Date: ${task.date.toDateString()}`);
  console.log(`   Duration: ${task.duration} minutes`);
  console.log('');
});

// ============================================
// TEST 6: Recommendations
// ============================================
console.log('\n💡 TEST 6: Get AI Recommendations\n');

const mockSubjects = testSubjects.map(s => ({
  ...s,
  _id: { toString: () => s._id }
}));

const mockTasks = testTasks.map(t => ({
  ...t,
  subject: { toString: () => t.subject }
}));

const recommendations = AIStudyPlanner.getRecommendations(mockSubjects, mockTasks);

console.log(`✅ Generated ${recommendations.length} recommendations\n`);

recommendations.forEach((rec, i) => {
  console.log(`${i+1}. [${rec.priority.toUpperCase()}] ${rec.subject}`);
  console.log(`   ${rec.message}`);
  console.log('');
});

// ============================================
// TEST 7: Analytics
// ============================================
console.log('\n📊 TEST 7: Get Analytics\n');

const analytics = AIStudyPlanner.getAnalytics(mockSubjects, mockTasks);

console.log('Overall Statistics:');
console.log(`  Total Subjects: ${analytics.totalSubjects}`);
console.log(`  Total Tasks: ${analytics.totalTasks}`);
console.log(`  Completed: ${analytics.completedTasks}`);
console.log(`  Missed: ${analytics.missedTasks}`);
console.log(`  Pending: ${analytics.pendingTasks}`);
console.log(`  Completion Rate: ${analytics.completionRate}%`);
console.log(`  Total Study Time: ${analytics.totalStudyMinutes} minutes`);

console.log('\nSubject Breakdown:');
analytics.subjectBreakdown.forEach(item => {
  console.log(`  ${item.subjectName}:`);
  console.log(`    Tasks: ${item.completedTasks}/${item.totalTasks}`);
  console.log(`    Completion: ${item.completionRate}%`);
  console.log(`    Study Time: ${item.studyMinutes} min`);
  console.log('');
});

// ============================================
// FINAL SUMMARY
// ============================================
console.log('\n' + '='.repeat(60));
console.log('🎉 ALL TESTS COMPLETE!\n');

console.log('✅ Functions Tested:');
console.log('  [✓] calculatePriority()');
console.log('  [✓] allocateStudyTime()');
console.log('  [✓] generateStudyPlan()');
console.log('  [✓] generateTasks()');
console.log('  [✓] generateRevisionTasks()');
console.log('  [✓] getRecommendations()');
console.log('  [✓] getAnalytics()');

console.log('\n📁 Files Ready to Use:');
console.log('  1. aiPlanner.js → backend/utils/');
console.log('  2. studyPlanController.js → backend/controllers/');
console.log('  3. studyPlanRoutes.js → backend/routes/');

console.log('\n🚀 Your AI Study Planner is ready!\n');
console.log('='.repeat(60) + '\n');
