import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CountdownContext } from '../contexts/CountdownContext';
import { Plus, Calendar } from 'lucide-react';
import ChatBot from '../components/ChatBot';

const Home = () => {
  const { countdowns, categories } = useContext(CountdownContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeLeft, setTimeLeft] = useState({});
  const [sortedCountdowns, setSortedCountdowns] = useState([]);
  
  // Filter and sort countdowns when dependencies change
  useEffect(() => {
    // Filter countdowns by category
    const filteredCountdowns = selectedCategory === 'All' 
      ? countdowns 
      : countdowns.filter(countdown => countdown.category === selectedCategory);

    // Sort countdowns by date (closest first)
    const sorted = [...filteredCountdowns].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    setSortedCountdowns(sorted);
  }, [countdowns, selectedCategory]);
  
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
  
  // Update time left for countdowns
  useEffect(() => {
    const calculateAllTimeLeft = () => {
      const newTimeLeft = {};
      sortedCountdowns.forEach(countdown => {
        newTimeLeft[countdown.id] = calculateTimeLeft(countdown.date);
      });
      setTimeLeft(newTimeLeft);
    };
    
    calculateAllTimeLeft();
    
    const interval = setInterval(calculateAllTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [sortedCountdowns]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countdown Vibes</h1>
        <div className="flex space-x-2">
          <Link to="/calendar" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </header>

      {/* Category Filter */}
      <div className="flex overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              selectedCategory === category.name
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
            }`}
            style={{ 
              borderColor: category.color,
              borderWidth: '1px'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Countdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCountdowns.length > 0 ? (
          sortedCountdowns.map(countdown => (
            <Link
              key={countdown.id}
              to={`/countdown/${countdown.id}`}
              className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{countdown.title}</h2>
              <div className="mb-2">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {timeLeft[countdown.id]?.days || 0}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">days</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {timeLeft[countdown.id]?.hours || 0}h {timeLeft[countdown.id]?.minutes || 0}m {timeLeft[countdown.id]?.seconds || 0}s
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date(countdown.date).toLocaleDateString()}
              </p>
              <span 
                className="inline-block px-2 py-1 rounded-full text-xs mt-2"
                style={{ backgroundColor: countdown.color || '#4f46e5', color: 'white' }}
              >
                {countdown.category}
              </span>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No events yet...</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Use the + button below to add your first event</p>
          </div>
        )}
      </div>

      {/* Floating Add Button removed as it's now in the BottomNavBar */}
      
      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};

export default Home;