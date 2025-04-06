import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CountdownContext } from '../contexts/CountdownContext';
import { ArrowLeft } from 'lucide-react';

const EditCountdown = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { countdowns, updateCountdown, categories } = useContext(CountdownContext);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: '',
    notes: '',
    reminder: false,
    reminderDays: 1
  });
  
  // Load countdown data
  useEffect(() => {
    const countdown = countdowns.find(c => c.id === id);
    
    if (countdown) {
      const date = new Date(countdown.date);
      
      setFormData({
        title: countdown.title,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        category: countdown.category,
        notes: countdown.notes || '',
        reminder: countdown.reminder || false,
        reminderDays: countdown.reminderDays || 1
      });
    } else {
      // Redirect if countdown not found
      navigate('/');
    }
  }, [id, countdowns, navigate]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time || '00:00'}`);
    
    // Get category color
    const selectedCategory = categories.find(cat => cat.name === formData.category);
    
    // Create updated countdown object
    const updatedCountdown = {
      id,
      title: formData.title,
      date: dateTime.toISOString(),
      category: formData.category,
      color: selectedCategory?.color || '#4f46e5',
      notes: formData.notes,
      reminder: formData.reminder,
      reminderDays: parseInt(formData.reminderDays)
    };
    
    // Update countdown
    updateCountdown(id, updatedCountdown);
    
    // Navigate back to detail page
    navigate(`/countdown/${id}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex items-center">
        <Link to={`/countdown/${id}`} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Countdown</h1>
      </header>
      
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time (optional)
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reminder"
              name="reminder"
              checked={formData.reminder}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Set reminder
            </label>
          </div>
          
          {formData.reminder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remind me (days before)
              </label>
              <input
                type="number"
                name="reminderDays"
                value={formData.reminderDays}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Update Countdown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCountdown;