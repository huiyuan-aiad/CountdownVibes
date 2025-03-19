import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

const AddCountdownPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCountdown, updateCountdown, getCountdown, categories, addCategory } = useCountdown();
  
  // 预定义类别列表
  const predefinedCategories = [
    { name: 'Celebrations', color: '#10b981' },
    { name: 'Milestones', color: '#3b82f6' },
    { name: 'Deadlines', color: '#ef4444' },
  ];
  const isEditMode = !!id;

  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '00:00',
    category: 'Celebrations',
    customCategory: '',
    color: '',
    notes: '',
    reminder: false,
    reminderDays: 1,
  });
  
  // 是否显示自定义类别输入
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const [errors, setErrors] = useState({});

  // 如果是编辑模式，加载现有倒计时数据
  useEffect(() => {
    if (isEditMode) {
      const countdown = getCountdown(id);
      if (countdown) {
        // 将ISO日期字符串分解为日期和时间
        const dateObj = new Date(countdown.date);
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        
        // 检查是否为自定义类别
        const isCustom = !predefinedCategories.some(cat => cat.name === countdown.category);
        
        setFormData({
          title: countdown.title,
          date: dateStr,
          time: timeStr,
          category: isCustom ? 'Custom' : countdown.category,
          customCategory: isCustom ? countdown.category : '',
          color: countdown.color || '',
          notes: countdown.notes || '',
          reminder: countdown.reminder || false,
          reminderDays: countdown.reminderDays || 1,
        });
        
        setShowCustomCategory(isCustom);
      } else {
        // 如果找不到倒计时，重定向到主页
        navigate('/');
      }
    }
  }, [id, isEditMode, getCountdown, navigate]);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 处理类别变化
    if (name === 'category') {
      setShowCustomCategory(value === 'Custom');
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // 清除相关错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // 表单验证
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
    
    // 验证自定义类别
    if (formData.category === 'Custom' && !formData.customCategory.trim()) {
      newErrors.customCategory = 'Custom category name is required';
    }
    
    if (formData.reminder && (!formData.reminderDays || formData.reminderDays < 1)) {
      newErrors.reminderDays = 'Please enter a valid number of days';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    // 组合日期和时间为ISO字符串
    const dateTimeStr = `${formData.date}T${formData.time}:00`;
    
    // 准备倒计时数据
    const countdownData = {
      title: formData.title,
      date: dateTimeStr,
      category: formData.category === 'Custom' ? formData.customCategory : formData.category,
      color: formData.color || getCategoryColor(formData.category),
      notes: formData.notes,
      reminder: formData.reminder,
      reminderDays: parseInt(formData.reminderDays, 10),
    };
    
    // 如果是自定义类别，添加到类别列表
    if (formData.category === 'Custom' && formData.customCategory) {
      try {
        // 检查类别是否已存在
        if (!categories.some(cat => cat.name === formData.customCategory)) {
          addCategory({
            name: formData.customCategory,
            color: formData.color || '#4f46e5' // 使用选择的颜色或默认颜色
          });
        }
      } catch (error) {
        console.error('Error adding custom category:', error);
      }
    }
    
    try {
      // 添加或更新倒计时
      if (isEditMode) {
        updateCountdown(id, countdownData);
        console.log('Countdown updated:', id);
      } else {
        const newId = addCountdown(countdownData);
        console.log('New countdown added:', newId);
      }
      
      // 重定向到主页
      navigate('/');
    } catch (error) {
      console.error('Error saving countdown:', error);
      setErrors({ submit: error.message });
    }
  };

  // 获取类别对应的颜色
  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#4f46e5'; // 默认使用主色
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 返回按钮 */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>
      
      <div className="glass rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {isEditMode ? 'Edit Countdown' : 'Add New Countdown'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Add CSS to hide default browser icons */}
          <style>{`
            input[type="date"]::-webkit-calendar-picker-indicator,
            input[type="time"]::-webkit-calendar-picker-indicator {
              opacity: 0;
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              cursor: pointer;
            }
            input[type="date"],
            input[type="time"] {
              position: relative;
            }
          `}</style>
          {/* 标题 */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="Enter countdown title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('date').showPicker()}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('time').showPicker()}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Clock className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 类别 */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              {categories.map(category => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
              <option value="Custom">Custom...</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            
            {/* 自定义类别输入 */}
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
                  className={`w-full px-4 py-2 rounded-lg border ${errors.customCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500`}
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
                          className={`color-circle w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300 scale-110' : 'hover:scale-105'}`}
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

          {/* 备注 */}
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add optional notes"
            ></textarea>
          </div>

          {/* 提醒设置 */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="reminder"
                name="reminder"
                checked={formData.reminder}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable reminder
              </label>
            </div>
            
            {formData.reminder && (
              <div className="ml-6">
                <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remind me days before
                </label>
                <input
                  type="number"
                  id="reminderDays"
                  name="reminderDays"
                  value={formData.reminderDays}
                  onChange={handleChange}
                  min="1"
                  className={`w-24 px-4 py-2 rounded-lg border ${errors.reminderDays ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                {errors.reminderDays && <p className="mt-1 text-sm text-red-500">{errors.reminderDays}</p>}
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
          
          {errors.submit && <p className="mt-3 text-sm text-red-500">{errors.submit}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddCountdownPage;