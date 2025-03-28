import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Calendar from './components/Calendar';
import FirebaseTest from './components/FirebaseTest';

function App() {
  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Countdown Vibes
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!currentUser ? (
                <>
                  <Link to="/signup" className="text-gray-600 hover:text-gray-900">
                    Sign Up
                  </Link>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/test" element={<FirebaseTest />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;