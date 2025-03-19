import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Moon, Sun, Trash2 } from 'lucide-react';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { categories, deleteCategory, predefinedCategories } = useCountdown();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // 检查浏览器是否支持通知
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [error, setError] = useState('');

  // 处理通知权限请求
  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      // 已经有权限，只需切换状态
      setNotificationsEnabled(!notificationsEnabled);
    } else if (Notification.permission !== 'denied') {
      // 请求权限
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else {
      // 权限被拒绝，提示用户在浏览器设置中启用
      alert('Please enable notifications in your browser settings');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 返回按钮 */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

        {/* 主题切换 */}
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

        {/* 通知设置 */}
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

        {/* 关于 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">About</h2>
          <div className="glass p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-1">Countdown Vibes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Version 0.1.0</p>
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