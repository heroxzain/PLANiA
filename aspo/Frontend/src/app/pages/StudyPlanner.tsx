import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { Home, BookOpen, Plus, Trash2, Edit, AlertCircle, CheckCircle } from 'lucide-react';

type ActionType = 'none' | 'add' | 'update' | 'remove';

export default function StudyPlanner() {
  const navigate = useNavigate();
  const { isAuthenticated, subjects, addSubject, updateSubject, removeSubject } = useAuth();
  const [action, setAction] = useState<ActionType>('none');
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [materials, setMaterials] = useState<FileList | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const resetForm = () => {
    setSubjectName('');
    setExamDate('');
    setDifficulty('medium');
    setMaterials(null);
    setAction('none');
    setMessage(null);
  };

 const handleAdd = async () => {
  if (!subjectName.trim()) {
    setMessage({ type: 'error', text: 'Please enter a subject name' });
    return;
  }

  if (!examDate) {
    setMessage({ type: 'error', text: 'Please select an exam date' });
    return;
  }

  if (subjects.some(s => s.name.toLowerCase() === subjectName.toLowerCase())) {
    setMessage({ type: 'error', text: 'Subject already exists.' });
    return;
  }

  await addSubject({
    name: subjectName,
    examDate,
    difficulty,
    materials: materials
      ? Array.from(materials).map(file => file.name)
      : []
  });

  setMessage({ type: 'success', text: `Subject "${subjectName}" added successfully!` });

  setTimeout(() => {
    resetForm();
  }, 2000);
};


  const handleUpdate = async () => {
    if (!subjectName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a subject name' });
      return;
    }

    const existingSubject = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    if (!existingSubject) {
      setMessage({ type: 'error', text: 'Subject not found. Use ADD to create a new subject.' });
      return;
    }

    const updates: any = {};
    if (examDate) updates.examDate = examDate;
    if (materials)
  updates.materials = [
    ...existingSubject.materials,
    ...Array.from(materials).map(file => file.name)
  ];


    await updateSubject(existingSubject._id, updates);

    setMessage({ type: 'success', text: `Subject "${subjectName}" updated successfully!` });
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  const handleRemove = async () => {
    if (!subjectName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a subject name' });
      return;
    }

    const existingSubject = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    if (!existingSubject) {
      setMessage({ type: 'error', text: 'Subject not found.' });
      return;
    }

   await removeSubject(existingSubject._id);

    setMessage({ type: 'success', text: `Subject "${subjectName}" removed successfully!` });
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  const handleGeneratePlan = async () => {
    const response = await fetch('/api/study-plan/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        subjects: subjects.map(subject => ({
          name: subject.name,
          examDate: subject.examDate,
          difficulty: subject.difficulty,
          materials: subject.materials
        })),
      }),
    });
    const data = await response.json();
    if (data.success) {
      setMessage({ type: 'success', text: data.message });
      setTimeout(() => navigate('/'), 1000);
    } else {
      setMessage({ type: 'error', text: data.message });
    }
  };

  const handleSubmit = () => {
    if (action === 'add') handleAdd();
    else if (action === 'update') handleUpdate();
    else if (action === 'remove') handleRemove();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl tracking-wide">PLANiA</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            HOME
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h2 className="text-2xl text-gray-800">Study Planner</h2>
            </div>

            {/* Subject Name Input */}
            <div className="mb-6">
              <label htmlFor="subjectName" className="block text-sm mb-2 text-gray-700">
                Subject Name
              </label>
              <input
                type="text"
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Mathematics, Physics, Chemistry"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => {
                  setAction('add');
                  setMessage(null);
                }}
                className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  action === 'add'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Plus className="w-5 h-5" />
                ADD
              </button>
              <button
                onClick={() => {
                  setAction('update');
                  setMessage(null);
                }}
                className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  action === 'update'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Edit className="w-5 h-5" />
                UPDATE
              </button>
              <button
                onClick={() => {
                  setAction('remove');
                  setMessage(null);
                }}
                className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  action === 'remove'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                REMOVE
              </button>
            </div>
            <div
              style={{margin: '30px 0px'}} 
              className="mt-8 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-100 text-center"
            >
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Ready to start?</h3>
              <p className="text-gray-600 mb-4">Once you have added all your subjects, let AI build your schedule.</p>
              <button
                style={{ margin: '10px' }}
                onClick={handleGeneratePlan}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
              >
                Generate My AI Study Plan 🚀
              </button>
               {/* to be update later:  */}
              {/* {<button
                style={{ margin: '10px' }}
                onClick={handleGenerateTask}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
              >
                Generate More Daily Tasks 🚀
              </button>}  */}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Form Fields based on Action */}
            {action === 'add' && (
              <div className="space-y-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <h3 className="text-lg text-gray-800">Add New Subject</h3>
                
                <div>
                  <label htmlFor="examDate" className="block text-sm mb-2 text-gray-700">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    id="examDate"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm mb-2 text-gray-700">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps AI generate content based on your level
                  </p>
                </div>

                <div>
                  <label htmlFor="materials" className="block text-sm mb-2 text-gray-700">
                    Study Materials (PPT/PDF)
                  </label>
                  <input
                    type="file"
                    id="materials"
                    multiple
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setMaterials(e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload multiple files
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {action === 'update' && (
              <div className="space-y-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg text-gray-800">Update Subject</h3>
                
                <div>
                  <label htmlFor="examDateUpdate" className="block text-sm mb-2 text-gray-700">
                    New Exam Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="examDateUpdate"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="materialsUpdate" className="block text-sm mb-2 text-gray-700">
                    Add More Study Materials (Optional)
                  </label>
                  <input
                    type="file"
                    id="materialsUpdate"
                    multiple
                    accept=".pdf,.ppt,.pptx"
                    onChange={(e) => setMaterials(e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {action === 'remove' && (
              <div className="space-y-6 p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="text-lg text-gray-800">Remove Subject</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove "{subjectName}"? This action cannot be undone.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Current Subjects List */}
            {subjects.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg mb-4 text-gray-800">Your Subjects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                    >
                      <h4 className="text-indigo-700 mb-2">{subject.name}</h4>
                      <p className="text-sm text-gray-600">
                        Exam: {new Date(subject.examDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Difficulty: <span className="capitalize">{subject.difficulty}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Materials: {subject.materials.length} file(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
