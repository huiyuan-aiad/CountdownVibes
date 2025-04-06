import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
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