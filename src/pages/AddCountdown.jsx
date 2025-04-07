import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CountdownContext } from '../contexts/CountdownContext';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

const AddCountdown = () => {
  const navigate = useNavigate();
  const { addCountdown, categories, addCategory } = useContext(CountdownContext);
  
  // Predefined categories list for reference
  const predefinedCategories = [
    { name: 'Celebrations', color: '#10b981' },
    { name: 'Milestones', color: '#3b82f6' },
    { name: 'Deadlines', color: '#ef4444' },
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    category: categories[0]?.name || '',
    customCategory: '',
    color: '',
    notes: '',
    reminder: false,
    reminderDays: 1
  });
  
  // Whether to show custom category input
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle category change
    if (name === 'category') {
      setShowCustomCategory(value === 'Custom');
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear related errors
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Validate custom category
    if (formData.category === 'Custom' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Custom category name is required';
    }
    
    if (formData.reminder && (!formData.reminderDays || formData.reminderDays < 1)) {
      newErrors.reminderDays = 'Please enter a valid number of days';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Get category color
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#4f46e5'; // Default to primary color
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time || '00:00'}`);
    
    // Prepare countdown data
    const countdownData = {
      id: uuidv4(),
      title: formData.title,
      date: dateTime.toISOString(),
      category: formData.category === 'Custom' ? formData.customCategory : formData.category,
      color: formData.color || getCategoryColor(formData.category),
      notes: formData.notes,
      reminder: formData.reminder,
      reminderDays: parseInt(formData.reminderDays, 10)
    };
    
    // If it's a custom category, add to category list
    if (formData.category === 'Custom' && formData.customCategory) {
      try {
        // Check if category already exists
        if (!categories.some(cat => cat.name === formData.customCategory)) {
          addCategory({
            name: formData.customCategory,
            color: formData.color || '#4f46e5' // Use selected color or default
          });
        }
      } catch (error) {
        console.error('Error adding custom category:', error);
      }
    }
    
    try {
      // Add countdown
      addCountdown(countdownData);
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error saving countdown:', error);
      setErrors({ submit: error.message });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 rounded-lg shadow-md p-4 mb-6 flex items-center">
        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Countdown</h1>
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
              <option value="Custom">Custom...</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            
            {/* Custom category input */}
            {showCustomCategory && (
              <div className="mt-3">
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  id="customCategory"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.customCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="Enter custom category name"
                />
                {errors.customCategory && <p className="mt-1 text-sm text-red-500">{errors.customCategory}</p>}
                
                <div className="mt-3">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Color
                  </label>
                  <div className="color-picker-container mt-2">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {[
                        '#10b981', // emerald-500
                        '#3b82f6', // blue-500
                        '#ef4444', // red-500
                        '#f59e0b', // amber-500
                        '#8b5cf6', // violet-500
                        '#ec4899', // pink-500
                        '#06b6d4', // cyan-500
                        '#84cc16', // lime-500
                        '#6366f1', // indigo-500
                        '#14b8a6', // teal-500
                        '#f97316', // orange-500
                        '#d946ef'  // fuchsia-500
                      ].map(color => (
                        <div 
                          key={color} 
                          onClick={() => {
                            setFormData({
                              ...formData,
                              color: color
                            });
                          }}
                          className={`color-circle w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        >
                          {formData.color === color && (
                            <div className="text-white text-xs font-medium">
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-center">
                      {formData.color && (
                        <div className="inline-block px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: formData.color }}>
                          {formData.customCategory || 'Custom'}
                        </div>
                      )}
                    </div>
                    <input
                      type="hidden"
                      id="color"
                      name="color"
                      value={formData.color || '#4f46e5'}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
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
              Add Countdown
            </button>
          </div>
          
          {errors.submit && <p className="mt-3 text-sm text-red-500">{errors.submit}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddCountdown;