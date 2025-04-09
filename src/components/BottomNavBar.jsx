import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Plus, Settings, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  // Check if the current path matches the link path
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 shadow-lg"
    >
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 rounded-t-xl shadow-lg px-4 py-2 mx-auto max-w-md w-full">
          <div className="flex items-center justify-around relative">
            {/* Home Button */}
            <Link 
              to="/" 
              className={`p-3 rounded-full flex flex-col items-center transition-colors ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            {/* ChatBot Button */}
            <Link 
              to="/chat" 
              className={`p-3 rounded-full flex flex-col items-center transition-colors ${isActive('/chat') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              onClick={(e) => {
                // Prevent default navigation since ChatBot is a modal
                e.preventDefault();
                // Navigate to /chat to trigger the ChatBot to open
                navigate('/chat');
              }}
            >
              <MessageSquare size={24} />
              <span className="text-xs mt-1">Chat</span>
            </Link>
            
            {/* Center Add Button (Floating above the navbar) */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Link 
                to="/add" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-colors"
                aria-label="Add countdown"
              >
                <Plus size={24} />
              </Link>
            </div>
            
            {/* SignUp/Me Button */}
            {currentUser ? (
              <Link 
                to="/settings" 
                className={`p-3 rounded-full flex flex-col items-center transition-colors ${isActive('/settings') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              >
                <Settings size={24} />
                <span className="text-xs mt-1">Me</span>
              </Link>
            ) : (
              <Link 
                to="/signup" 
                className={`p-3 rounded-full flex flex-col items-center transition-colors ${isActive('/signup') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              >
                <UserPlus size={24} />
                <span className="text-xs mt-1">Sign Up</span>
              </Link>
            )}
            
            {/* Login/Logout Button */}
            {currentUser ? (
              <button 
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-3 rounded-full flex flex-col items-center transition-colors text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                <LogOut size={24} />
                <span className="text-xs mt-1">Logout</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className={`p-3 rounded-full flex flex-col items-center transition-colors ${isActive('/login') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}
              >
                <LogIn size={24} />
                <span className="text-xs mt-1">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavBar;