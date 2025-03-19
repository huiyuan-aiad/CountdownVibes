import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const CountdownDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCountdown, deleteCountdown, calculateTimeLeft } = useCountdown();
  
  const [countdown, setCountdown] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // 加载倒计时数据
  useEffect(() => {
    const countdownData = getCountdown(id);
    if (countdownData) {
      setCountdown(countdownData);
    } else {
      // 如果找不到倒计时，重定向到主页
      navigate('/');
    }
  }, [id, getCountdown, navigate]);
  
  // 实时更新倒计时
  useEffect(() => {
    if (!countdown) return;
    
    // 初始计算
    const updateTimeLeft = () => {
      setTimeLeft(calculateTimeLeft(countdown.date));
    };
    
    updateTimeLeft();
    
    // 每秒更新一次
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [countdown, calculateTimeLeft]);
  
  // 处理删除倒计时
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this countdown?')) {
      deleteCountdown(id);
      navigate('/');
    }
  };
  
  // 如果倒计时数据尚未加载，显示加载状态
  if (!countdown) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 返回按钮 */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>
      
      <div className="glass rounded-xl p-6 md:p-8">
        {/* 标题和操作按钮 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
            {countdown.title}
          </h1>
          
          <div className="flex space-x-2">
            <Link 
              to={`/edit/${id}`}
              className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              aria-label="Edit countdown"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              aria-label="Delete countdown"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 倒计时显示 */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="glass rounded-lg p-3">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                {timeLeft.days}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Days</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                {timeLeft.hours}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Hours</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                {timeLeft.minutes}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Minutes</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                {timeLeft.seconds}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Seconds</div>
            </div>
          </div>
        </div>
        
        {/* 详细信息 */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Date & Time</h2>
            <p className="text-gray-600 dark:text-gray-400">{formatDate(countdown.date)}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</h2>
            <div 
              className="inline-block px-3 py-1 rounded-full text-sm" 
              style={{ 
                backgroundColor: `${countdown.color}20`, 
                color: countdown.color,
                borderLeft: `2px solid ${countdown.color}` 
              }}
            >
              {countdown.category}
            </div>
          </div>
          
          {countdown.notes && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{countdown.notes}</p>
            </div>
          )}
          
          {countdown.reminder && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Reminder</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Reminder set for {countdown.reminderDays} {countdown.reminderDays === 1 ? 'day' : 'days'} before the event
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownDetailPage;