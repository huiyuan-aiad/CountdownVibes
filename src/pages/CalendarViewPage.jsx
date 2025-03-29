import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';

const CalendarViewPage = () => {
  const { countdowns } = useCountdown() || { countdowns: [] };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [viewType, setViewType] = useState('month'); // 'month' or 'year'
  const [expandedDay, setExpandedDay] = useState(null);
  const [yearView, setYearView] = useState([]);
  
  // Generate calendar days for the current month
  useEffect(() => {
    if (viewType === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek;
      
      // Calculate total days to show (previous month days + current month days)
      const totalDays = daysFromPrevMonth + lastDay.getDate();
      
      // Calculate rows needed (7 days per row)
      const rows = Math.ceil(totalDays / 7);
      
      // Generate calendar days array
      const days = [];
      
      // Add days from previous month
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
        days.push({
          date: new Date(year, month - 1, i),
          isCurrentMonth: false,
          isToday: false
        });
      }
      
      // Add days from current month
      const today = new Date();
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.toDateString() === today.toDateString()
        });
      }
      
      // Add days from next month to fill the remaining cells
      const remainingDays = rows * 7 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          isToday: false
        });
      }
      
      setCalendarDays(days);
      // Reset expanded day when month changes
      setExpandedDay(null);
    } else {
      // Generate year view data
      generateYearViewData();
    }
  }, [currentDate, viewType]);
  
  // Generate year view data
  const generateYearViewData = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthEvents = countdowns.filter(countdown => {
        const countdownDate = new Date(countdown.date);
        return countdownDate.getFullYear() === year && countdownDate.getMonth() === month;
      });
      
      months.push({
        name: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' }),
        events: monthEvents,
        date: new Date(year, month, 1)
      });
    }
    
    setYearView(months);
  };
  
  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };
  
  // Navigate to previous year
  const goToPrevYear = () => {
    setCurrentDate(prev => {
      const prevYear = new Date(prev);
      prevYear.setFullYear(prev.getFullYear() - 1);
      return prevYear;
    });
  };
  
  // Navigate to next year
  const goToNextYear = () => {
    setCurrentDate(prev => {
      const nextYear = new Date(prev);
      nextYear.setFullYear(prev.getFullYear() + 1);
      return nextYear;
    });
  };
  
  // Handle month click in year view
  const handleMonthClick = (month) => {
    setCurrentDate(month.date);
    setViewType('month');
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Get countdowns for a specific date
  const getCountdownsForDate = (date) => {
    const dateString = date.toDateString();
    return countdowns.filter(countdown => {
      const countdownDate = new Date(countdown.date);
      return countdownDate.toDateString() === dateString;
    });
  };
  
  // Handle day click to expand/collapse
  const handleDayClick = (day, dayCountdowns) => {
    if (dayCountdowns.length === 0) return;
    
    if (expandedDay && expandedDay.date.toDateString() === day.date.toDateString()) {
      setExpandedDay(null); // Collapse if already expanded
    } else {
      setExpandedDay({ ...day, countdowns: dayCountdowns }); // Expand with countdowns
    }
  };
  
  // Day of week headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>
      
      <div className="glass rounded-xl p-6">
        {/* Calendar header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendar</h1>
          
          <div className="flex items-center space-x-4">
            {/* View type toggle */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setViewType('month')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewType === 'month' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Month
              </button>
              <button
                onClick={() => setViewType('year')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewType === 'year' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4 inline-block mr-1" />
                Year
              </button>
            </div>
            
            {viewType === 'month' ? (
              <>
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(currentDate)}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goToPrevYear}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Previous year"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToNextYear}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Next year"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Expanded day view */}
        {expandedDay && viewType === 'month' && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {expandedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button 
                onClick={() => setExpandedDay(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {expandedDay.countdowns.map(countdown => (
                <Link 
                  to={`/countdown/${countdown.id}`} 
                  key={countdown.id}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: countdown.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{countdown.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(countdown.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Year view */}
        {viewType === 'year' && (
          <div className="grid grid-cols-3 gap-4">
            {yearView.map((month) => (
              <div 
                key={month.name}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMonthClick(month)}
              >
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  {month.name}
                </h3>
                
                {month.events.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {month.events.slice(0, 7).map((event, i) => (
                        <div 
                          key={`${event.id}-${i}`}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {month.events.length} {month.events.length === 1 ? 'event' : 'events'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No events</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">0 events</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Month view calendar grid */}
        {viewType === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayCountdowns = getCountdownsForDate(day.date);
              const isExpanded = expandedDay && expandedDay.date.toDateString() === day.date.toDateString();
              
              return (
                <div 
                  key={index} 
                  className={`min-h-[100px] p-2 rounded-lg cursor-pointer ${
                    day.isCurrentMonth 
                      ? day.isToday 
                        ? 'bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700' 
                        : isExpanded
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600'
                  }`}
                  onClick={() => handleDayClick(day, dayCountdowns)}
                >
                  <div className="text-right mb-1">
                    {day.date.getDate()}
                  </div>
                  
                  {/* Event dots */}
                  {dayCountdowns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayCountdowns.map((countdown, i) => (
                        <div 
                          key={countdown.id}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: countdown.color }}
                          title={countdown.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarViewPage;