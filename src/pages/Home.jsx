import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CountdownContext } from '../contexts/CountdownContext';
import { Plus, Calendar, Settings } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import NavBar from '../components/NavBar';

const Home = () => {
  const { countdowns, categories } = useContext(CountdownContext);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter countdowns by category
  const filteredCountdowns = selectedCategory === 'All' 
    ? countdowns 
    : countdowns.filter(countdown => countdown.category === selectedCategory);

  // Sort countdowns by date (closest first)
  const sortedCountdowns = [...filteredCountdowns].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* NavBar */}
      <NavBar />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countdown Vibes</h1>
        <div className="flex space-x-2">
          <Link to="/calendar" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Link>
          <Link to="/settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
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
            <p className="text-gray-500 dark:text-gray-400 mb-4">No events yet...</p>
            <Link
              to="/add"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={18} className="mr-1" />
              Add Event
            </Link>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Link
        to="/add"
        className="fixed bottom-20 right-5 bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700"
        aria-label="Add countdown"
      >
        <Plus size={24} />
      </Link>
      
      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};

export default Home;