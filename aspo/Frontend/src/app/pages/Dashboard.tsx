import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';


export default function Dashboard() {
  const { isAuthenticated, user, subjects } = useAuth();
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Get Weekly Plan
      const planRes = await fetch('/api/study-plan', { headers });
      const planData = await planRes.json();
      
      if (planData.success) {
        // Transform Backend Data for Frontend Display
        let schedule = planData.data.map((day: any) => ({
          day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
          tasks: day.plan.map((p: any) => `${p.subject.name} (${Math.round(p.minutes)}m)`)
        }));
        schedule = schedule.filter((_, index) => index<7);
        setWeeklySchedule(schedule);
      }

      // 2. Get Tasks & Analytics
      const tasksRes = await fetch('/api/tasks', { headers });
      const tasksData = await tasksRes.json();

      if(tasksRes.ok) {
        const todayStr = new Date().toDateString();
        const todayTasks = tasksData
        .filter((t: any) => new Date(t.date).toDateString() === todayStr)
        .map((t: any) => ({
          id: t._id,
          task: `${t.subject.name}: ${t.title} (${t.duration}m)`,
          completed: t.status === 'completed',
        }));      
        setTodaysTasks(todayTasks);  
      }
      
      // 3. Get Analytics for Progress Bar
      const analyticsRes = await fetch('/api/study-plan/analytics', { headers });
      const analyticsData = await analyticsRes.json();
      if(analyticsData.success) {
        setProgress(analyticsData.data.completionRate || 0);
      }

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setTodaysTasks(tasks =>
        tasks.map(task =>
          task.id === id ? { ...task, completed: true } : task
        )
      );

      const headers = { Authorization: `Bearer ${token}` };
      const analyticsRes = await fetch('/api/study-plan/analytics', { headers });
      const analyticsData = await analyticsRes.json();
      if(analyticsData.success) {
        setProgress(analyticsData.data.completionRate || 0);
      }

    } catch (e) {
      console.error('Failed to update task status', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {!isAuthenticated ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
                <div className="mb-6">
                  <Calendar className="w-16 h-16 mx-auto text-indigo-600" />
                </div>
                <h2 className="text-2xl mb-4 text-gray-800">Welcome to PLANiA</h2>
                <p className="text-gray-600 mb-8">
                  Your AI-powered study companion. Please sign in or create an account to access your personalized study planner and track your progress.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl text-gray-800">
                  Welcome back, <span className="text-indigo-600">{user?.displayName}</span>! 👋
                </h2>
                <p className="text-gray-600 mt-2">Here's your study progress and schedule</p>
              </div>

              {/* Progress Bar Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl text-gray-800">Overall Progress</h3>
                </div>
                <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="text-white text-sm px-2">{progress}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on completed tasks and time until exams
                </p>
              </div>

              {/* Weekly Schedule Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl text-gray-800">Weekly Schedule</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {weeklySchedule.map((item, index) => (
                    <div
                      key={`${item} 1 ${index}`}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200 hover:shadow-lg transition-shadow"
                    >
                      <h4 key={`${item} 2 ${index}`} className="text-indigo-700 mb-2">{item.day}</h4>
                      {item.tasks.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700 leading-relaxed">
                          {item.tasks.map((task: string, i: number) => (
                            <li key={i}>{task}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Rest Day 💤</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  * Schedule is AI-generated based on your subjects and exam dates
                </p>
              </div>

              {/* Daily Tasks Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl text-gray-800">Today's Tasks</h3>
                </div>
                <div className="space-y-3">
                  {todaysTasks.map((item, index) => (
                    <div
                      key={`${item} 4 ${index}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => toggleTask(item.id)}
                    >
                      <input
                        key={`${item} 5 ${index}`}
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleTask(item.id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span
                      key={`${item} 6 ${index}`}
                      className={`flex-1 ${
                          item.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  * Tasks are updated daily from your weekly schedule
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
