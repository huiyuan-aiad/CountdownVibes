import { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useCountdown } from '../contexts/CountdownContext';
import { ArrowLeft, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const CalendarViewPage = () => {
  const { countdowns } = useCountdown();
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'

  // Get events for a specific date
  const getCountdownsForDate = (date) => {
    return countdowns.filter(countdown => {
      const countdownDate = new Date(countdown.date);
      return (
        countdownDate.getDate() === date.getDate() &&
        countdownDate.getMonth() === date.getMonth() &&
        countdownDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get events for a specific month
  const getCountdownsForMonth = (year, month) => {
    return countdowns.filter(countdown => {
      const countdownDate = new Date(countdown.date);
      return (
        countdownDate.getMonth() === month &&
        countdownDate.getFullYear() === year
      );
    });
  };

  // Custom tile content for month view
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dateCountdowns = getCountdownsForDate(date);
    if (dateCountdowns.length === 0) return null;

    return (
      <div className="flex justify-center mt-1">
        {dateCountdowns.map((countdown, index) => (
          <div 
            key={index}
            className="w-2 h-2 rounded-full mx-0.5"
            style={{ backgroundColor: countdown.color || '#4f46e5' }}
          />
        ))}
      </div>
    );
  };

  // Handle date click
  const handleDateClick = (value) => {
    setDate(value);
  };

  // Get selected date countdowns
  const selectedDateCountdowns = getCountdownsForDate(date);

  // Render year view
  const renderYearView = () => {
    const year = date.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {months.map(month => {
          const monthEvents = getCountdownsForMonth(year, month);
          const monthDate = new Date(year, month, 1);
          
          return (
            <div 
              key={month} 
              className="glass p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setDate(monthDate);
                setViewMode('month');
              }}
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                {monthDate.toLocaleString('default', { month: 'long' })}
              </h3>
              {monthEvents.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {monthEvents.map((event, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.color || '#4f46e5' }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No events</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendar View</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
              title="Month view"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'year'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
              title="Year view"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar component */}
        {viewMode === 'month' ? (
          <>
            <div className="mb-6 calendar-container">
              <Calendar 
                onChange={handleDateClick} 
                value={date} 
                tileContent={tileContent}
                className="w-full border-none shadow-none bg-transparent"
                calendarType="gregory"
                showFixedNumberOfWeeks={true}
                formatShortWeekday={(locale, date) => 
                  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]
                }
              />
            </div>

            {/* Selected date events */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Events on {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>

              {selectedDateCountdowns.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateCountdowns.map(countdown => (
                    <Link to={`/countdown/${countdown.id}`} key={countdown.id} className="block">
                      <div className="glass rounded-lg p-4 transition-transform hover:scale-102 hover:shadow-md">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white">{countdown.title}</h3>
                          <span 
                            className="px-2 py-1 text-xs rounded-full" 
                            style={{ backgroundColor: `${countdown.color}20`, color: countdown.color, borderLeft: `2px solid ${countdown.color}` }}
                          >
                            {countdown.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(countdown.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No events scheduled for this date.
                </p>
              )}
            </div>
          </>
        ) : (
          renderYearView()
        )}
      </div>

      {/* Custom styles */}
      <style jsx>{`
        /* Calendar styles */
        .calendar-container .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }

        .calendar-container .react-calendar__month-view__weekdays {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }

        .calendar-container .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-container .react-calendar__tile {
          padding: 0.75em 0.5em;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          margin: 2px;
          max-width: none !important;
        }

        .calendar-container .react-calendar__tile--now {
          background: rgba(79, 70, 229, 0.2);
        }

        .calendar-container .react-calendar__tile--active {
          background: rgba(79, 70, 229, 0.6);
          color: white;
        }

        .calendar-container .react-calendar__navigation button {
          color: #4f46e5;
          font-weight: bold;
        }

        .dark .calendar-container .react-calendar__navigation button {
          color: #818cf8;
        }

        .dark .calendar-container .react-calendar__month-view__weekdays {
          color: #e5e7eb;
        }

        .dark .calendar-container .react-calendar__tile {
          color: #e5e7eb;
          background: rgba(31, 41, 55, 0.4);
        }

        .dark .calendar-container .react-calendar__tile--now {
          background: rgba(79, 70, 229, 0.3);
        }

        .dark .calendar-container .react-calendar__tile--active {
          background: rgba(79, 70, 229, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CalendarViewPage;