import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl tracking-wide cursor-pointer" onClick={() => navigate('/')}>
          PLANiA
        </h1>
        <div className="flex gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/planner')}
                className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                STUDY PLAN
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
