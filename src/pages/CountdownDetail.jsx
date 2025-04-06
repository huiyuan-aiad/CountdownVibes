import { useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CountdownContext } from '../contexts/CountdownContext';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const CountdownDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { countdowns, deleteCountdown } = useContext(CountdownContext);
  
  const countdown = countdowns.find(c => c.id === id);
  
  if (!countdown) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">Countdown not found</p>
        <Link
          to="/"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Home
        </Link>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this countdown?')) {
      deleteCountdown(id);
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countdown Details</h1>
        <div className="flex space-x-2">
          <Link
            to={`/edit/${id}`}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Edit size={20} />
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>
      
      {/* Countdown Details */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{countdown.title}</h2>
        
        <div className="mb-4">
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: countdown.color || '#4f46e5', color: 'white' }}
          >
            {countdown.category}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          <strong>Date:</strong> {new Date(countdown.date).toLocaleDateString()}
        </p>
        
        {countdown.notes && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p className="text-gray-600 dark:text-gray-300">{countdown.notes}</p>
          </div>
        )}
        
        {countdown.reminder && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              Reminder set for {countdown.reminderDays} day(s) before the event
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownDetail;