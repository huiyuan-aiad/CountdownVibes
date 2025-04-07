import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';
import { CountdownContext } from '../contexts/CountdownContext';

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { categories, deleteCategory, predefinedCategories = [] } = useContext(CountdownContext);
  
  // State for error messages
  const [error, setError] = useState('');
  
  // State for notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Handle category deletion
  const handleDeleteCategory = (categoryName) => {
    try {
      deleteCategory(categoryName);
      setError('');
      
      // Show success notification
      setNotification({
        show: true,
        message: 'Category deleted successfully',
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
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex items-center">
        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </header>
      
      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-800 dark:text-white font-medium">Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={theme === 'dark'} 
              onChange={toggleTheme} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-800 dark:text-white font-medium">Notifications</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        <div className="py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-800 dark:text-white font-medium">Default Reminder Days</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">1 day</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            defaultValue="1"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        
        {/* Category Management */}
        <div className="py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white font-medium mb-3">Category Management</h3>
          
          {/* Category List */}
          <div className="space-y-3 mt-4">
            {categories.map(category => {
              const isPredefined = predefinedCategories.some(c => c.name === category.name);
              return (
                <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                      onClick={() => handleDeleteCategory(category.name)}
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
        
        <div className="py-3">
          <h3 className="text-gray-800 dark:text-white font-medium mb-3">About</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">CountdownVibes v1.0.0</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">A modern countdown app for tracking important events.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;