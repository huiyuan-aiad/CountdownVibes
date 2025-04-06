import { useState, useContext } from 'react';
import { X, Calendar, Clock, MapPin, Check, Tag, DollarSign } from 'lucide-react';
import { CountdownContext } from '../contexts/CountdownContext';

const EventSelectionModal = ({ event, onClose, onConfirm }) => {
  const { categories } = useContext(CountdownContext);
  // Build initial notes with all available information
  const buildInitialNotes = () => {
    let notes = '';
    
    // Add location information
    if (event.location) {
      notes += `Location: ${event.location}\n`;
    } else if (event.venue) {
      notes += `Venue: ${event.venue}`;
      if (event.city) notes += `, ${event.city}`;
      if (event.state) notes += `, ${event.state}`;
      if (event.country) notes += `, ${event.country}`;
      notes += '\n';
    }
    
    // Add price information if available
    if (event.priceRange) {
      notes += `Price Range: ${event.priceRange}\n`;
    }
    
    // Add genre information if available
    if (event.genre && event.genre !== event.category) {
      notes += `Genre: ${event.genre}`;
      if (event.subGenre && event.subGenre !== event.genre) {
        notes += ` / ${event.subGenre}`;
      }
      notes += '\n';
    }
    
    // Add link to original event
    if (event.url) {
      notes += `\nTickets & more info: ${event.url}`;
    }
    
    return notes.trim();
  };

  const [formData, setFormData] = useState({
    title: event.name,
    date: event.localDate || new Date(event.date).toISOString().split('T')[0],
    time: event.localTime || new Date(event.date).toTimeString().slice(0, 5),
    category: event.category || 'Event',
    notes: buildInitialNotes(),
    reminder: true,
    reminderDays: 1
  });

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
    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    // Create countdown object
    const countdown = {
      id: event.id,
      title: formData.title,
      date: dateTime.toISOString(),
      category: formData.category,
      color: getCategoryColor(formData.category, categories),
      notes: formData.notes,
      reminder: formData.reminder,
      reminderDays: parseInt(formData.reminderDays),
      image: event.image
    };
    
    onConfirm(countdown);
  };

  // Helper function to get category color
  const getCategoryColor = (categoryName, categories) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#4f46e5';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-lg text-gray-900 dark:text-white">Add Event to Countdowns</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        {event.image && (
          <div className="h-40 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.name} 
              className="w-full h-full object-cover"
            />
            
            {/* Event badges */}
            <div className="absolute top-4 right-4 flex flex-wrap gap-2">
              {event.category && (
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-white bg-opacity-90 text-gray-800 shadow-sm">
                  <Tag size={12} className="mr-1" />
                  {event.category}
                </div>
              )}
              
              {event.priceRange && (
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-white bg-opacity-90 text-gray-800 shadow-sm">
                  <DollarSign size={12} className="mr-1" />
                  {event.priceRange}
                </div>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Title
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
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
                Notes
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
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              <Check size={16} className="mr-1" />
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventSelectionModal;