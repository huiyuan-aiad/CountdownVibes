import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCountdown } from '../contexts/CountdownContext';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Calendar, Settings, Search } from 'lucide-react';

const HomePage = () => {
  const { theme } = useTheme();
  const { countdowns, categories } = useCountdown() || { countdowns: [], categories: [] };
  
  // Use a single state for filters
  const [filters, setFilters] = useState({
    category: 'All',
    search: ''
  });
  
  const [filteredCountdowns, setFilteredCountdowns] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  
  // Define the filterByCategory function that was missing
  const filterByCategory = (category) => {
    if (!category) return countdowns || [];
    return (countdowns || []).filter(countdown => countdown.category === category);
  };
  
  // Calculate time left function
  const calculateTimeLeft = (dateString) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };
  
  // When filters change, update filteredCountdowns
  useEffect(() => {
    // First filter by category
    let filtered = filterByCategory(filters.category === 'All' ? null : filters.category);
    
    // Then filter by search term
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(countdown => 
        countdown.title.toLowerCase().includes(term) ||
        countdown.notes?.toLowerCase().includes(term)
      );
    }
    
    setFilteredCountdowns(filtered);
  }, [filters, countdowns]);
  
  // Update time left for countdowns
  useEffect(() => {
    const calculateAllTimeLeft = () => {
      const newTimeLeft = {};
      filteredCountdowns.forEach(countdown => {
        newTimeLeft[countdown.id] = calculateTimeLeft(countdown.date);
      });
      setTimeLeft(newTimeLeft);
    };
    
    calculateAllTimeLeft();
    
    const interval = setInterval(calculateAllTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [filteredCountdowns]);
  
  // Handle search input
  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category
    }));
  };
  
  // Get category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#4f46e5';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
      
      {/* Search bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search countdowns..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => handleCategoryChange('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.category === 'All' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.name}
            onClick={() => handleCategoryChange(category.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.category === category.name ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            style={filters.category === category.name ? {} : { borderLeft: `3px solid ${category.color}` }}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Countdown grid */}
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