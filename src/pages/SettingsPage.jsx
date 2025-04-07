import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Moon, Sun, Trash2, LogOut, User, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// Removed useApi import as the Ticketmaster toggle is no longer needed

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const countdownContext = useCountdown() || {};
  const { categories = [], deleteCategory, predefinedCategories = [] } = countdownContext;
  // Removed useTicketmaster and toggleTicketmaster as they're no longer needed
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [error, setError] = useState('');

  // Handle notification permission request
  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      // Already have permission, just toggle state
      setNotificationsEnabled(!notificationsEnabled);
    } else if (Notification.permission !== 'denied') {
      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else {
      // Permission denied, prompt user to enable in browser settings
      alert('Please enable notifications in your browser settings');
    }
  };

  const auth = useAuth();
  const signOut = auth?.signOut;
  const currentUser = auth?.currentUser;
  
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleLogout = async () => {
    if (!signOut) return;
    
    try {
      await signOut();
      // Redirect happens automatically due to auth state change
    } catch (error) {
      console.error("Failed to log out:", error);
      setNotification({
        show: true,
        message: 'Failed to log out. Please try again.',
        type: 'error'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

        {/* User Profile Section - Added */}
        {currentUser && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">User Profile</h2>
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full">
                  <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">{currentUser.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Logged in user</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600" />
              )}
            </button>
          </div>
        </div>

        {/* Notification settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Notifications</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Enable browser notifications
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          {!notificationsEnabled && 'Notification' in window && Notification.permission === 'denied' && (
            <p className="mt-2 text-sm text-red-500">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>

        {/* API Settings section removed as AI model will automatically determine when to use external tools */}

        {/* Category Management */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Category Management</h2>
          <div className="space-y-3">
            {categories.map(category => {
              const isPredefined = predefinedCategories.some(c => c.name === category.name);
              return (
                <div key={category.name} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    {isPredefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">(Predefined)</span>
                    )}
                  </div>
                  {!isPredefined && (
                    <button
                      onClick={() => {
                        try {
                          deleteCategory(category.name);
                          setError('');
                        } catch (err) {
                          setError(err.message);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* About */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">About</h2>
          <div className="glass p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-1">Countdown Vibes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Version 0.1.1</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A modern countdown app for tracking your important events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;