import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Moon, Sun, Trash2, LogOut, User, Music, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// Removed useApi import as the Ticketmaster toggle is no longer needed

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const countdownContext = useCountdown() || {};
  const { categories = [], deleteCategory, predefinedCategories = [], addCategory } = countdownContext;
  // Removed useTicketmaster and toggleTicketmaster as they're no longer needed
  
  // State for custom category creation
  const [customCategory, setCustomCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  
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

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!customCategory.trim() || !selectedColor) {
      setError('Category name and color are required');
      return;
    }
    
    // Check if category already exists
    if (categories.some(cat => cat.name === customCategory)) {
      setError('A category with this name already exists');
      return;
    }
    
    try {
      addCategory({
        name: customCategory,
        color: selectedColor
      });
      
      // Reset form
      setCustomCategory('');
      setSelectedColor('#10b981');
      setError('');
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Category added successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

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
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
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
          
          {/* Add Custom Category Form */}
          <div className="glass p-4 rounded-lg mb-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Add Custom Category</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="customCategory"
                  value={customCategory || ''}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter custom category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Color
                </label>
                <div className="color-picker-container mt-2">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[
                      '#10b981', // emerald-500
                      '#3b82f6', // blue-500
                      '#ef4444', // red-500
                      '#f59e0b', // amber-500
                      '#8b5cf6', // violet-500
                      '#ec4899', // pink-500
                      '#06b6d4', // cyan-500
                      '#84cc16', // lime-500
                      '#6366f1', // indigo-500
                      '#14b8a6', // teal-500
                      '#f97316', // orange-500
                      '#d946ef'  // fuchsia-500
                    ].map(color => (
                      <div 
                        key={color} 
                        onClick={() => setSelectedColor(color)}
                        className={`color-circle w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <div className="text-white text-xs font-medium">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    {selectedColor && customCategory && (
                      <div className="inline-block px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: selectedColor }}>
                        {customCategory}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddCategory}
                  disabled={!customCategory || !selectedColor}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
          
          {/* Category List */}
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