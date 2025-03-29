import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import Login from './components/Login';
import SignUp from './components/SignUp';
import FirebaseTest from './components/FirebaseTest';
import CalendarViewPage from './pages/CalendarViewPage';
import HomePage from './pages/HomePage';
import AddCountdownPage from './pages/AddCountdownPage';
import CountdownDetailPage from './pages/CountdownDetailPage';
import SettingsPage from './pages/SettingsPage';
import { User } from 'lucide-react';

function App() {
  // Add a safe check for the auth context
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const signOut = auth?.signOut;

  const handleLogout = async () => {
    if (!signOut) return;
    
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                Countdown Vibes
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!currentUser ? (
                <>
                  <Link to="/signup" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Sign Up
                  </Link>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center mr-4">
                    <User className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                      {currentUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/calendar" element={<CalendarViewPage />} />
          <Route path="/add" element={<AddCountdownPage />} />
          <Route path="/edit/:id" element={<AddCountdownPage />} />
          <Route path="/countdown/:id" element={<CountdownDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/test" element={<FirebaseTest />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;