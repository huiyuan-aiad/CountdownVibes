import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCountdown } from '../contexts/CountdownContext';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Calendar, Settings, Search } from 'lucide-react';

const HomePage = () => {
  const { countdowns, categories, filterByCategory, calculateTimeLeft } = useCountdown();
  const { theme } = useTheme();
  
  // 状态
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredCountdowns, setFilteredCountdowns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeLeft, setTimeLeft] = useState({});
  
  // 当类别或搜索词变化时，过滤倒计时
  useEffect(() => {
    // 首先按类别过滤
    let filtered = filterByCategory(activeCategory === 'All' ? null : activeCategory);
    
    // 然后按搜索词过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(countdown => 
        countdown.title.toLowerCase().includes(term) ||
        countdown.notes?.toLowerCase().includes(term)
      );
    }
    
    setFilteredCountdowns(filtered);
  }, [activeCategory, searchTerm, countdowns, filterByCategory]);
  
  // 实时更新倒计时
  useEffect(() => {
    // 初始计算
    const calculateAllTimeLeft = () => {
      const newTimeLeft = {};
      filteredCountdowns.forEach(countdown => {
        newTimeLeft[countdown.id] = calculateTimeLeft(countdown.date);
      });
      setTimeLeft(newTimeLeft);
    };
    
    calculateAllTimeLeft();
    
    // 每秒更新一次
    const interval = setInterval(calculateAllTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [filteredCountdowns, calculateTimeLeft]);
  
  // 处理搜索输入
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理类别切换
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // 获取类别对应的颜色
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#4f46e5'; // 默认使用主色
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Countdown Vibes</h1>
        <div className="flex space-x-2">
          <Link to="/calendar" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Link>
          <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </div>
      
      {/* 搜索栏 */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search countdowns..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {/* 类别过滤器 */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleCategoryChange('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'All' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.name}
            onClick={() => handleCategoryChange(category.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category.name ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            style={activeCategory === category.name ? {} : { borderLeft: `3px solid ${category.color}` }}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* 倒计时网格 */}
      {filteredCountdowns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountdowns.map(countdown => {
            const time = timeLeft[countdown.id] || { days: 0, hours: 0, minutes: 0, seconds: 0 };
            const categoryColor = getCategoryColor(countdown.category);
            
            return (
              <Link to={`/countdown/${countdown.id}`} key={countdown.id} className="block">
                <div className="glass rounded-xl p-6 h-full transition-transform hover:scale-105 hover:shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{countdown.title}</h2>
                    <span 
                      className="px-2 py-1 text-xs rounded-full" 
                      style={{ backgroundColor: `${categoryColor}20`, color: categoryColor, borderLeft: `2px solid ${categoryColor}` }}
                    >
                      {countdown.category}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                      {time.days}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {time.hours}h {time.minutes}m {time.seconds}s
                    </div>
                  </div>
                  
                  {countdown.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{countdown.notes}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {countdowns.length === 0 
              ? "You don't have any countdowns yet." 
              : "No countdowns match your search or filter."}
          </p>
          {countdowns.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Click the + button below to create your first countdown!
            </p>
          )}
        </div>
      )}
      
      {/* 添加按钮 */}
      <Link 
        to="/add" 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Add new countdown"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default HomePage;