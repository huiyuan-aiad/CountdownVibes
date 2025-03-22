import React from 'react';
import Calendar from 'react-calendar';
import { trackViewChange, trackFeatureUsage } from '../utils/analytics';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ events, onViewChange, view, onDateSelect }) => {
  const handleViewChange = (newView) => {
    onViewChange(newView);
    trackViewChange(newView);
    trackFeatureUsage('view_switch', { from: view, to: newView });
  };

  const handleDateClick = (date) => {
    trackFeatureUsage('date_selected', { 
      date: date.toISOString(),
      view: view,
      hasEvents: events.some(event => 
        new Date(event.date).toDateString() === date.toDateString()
      )
    });
    
    onDateSelect(date);
  };

  const tileContent = ({ date, view }) => {
    const dayEvents = events.filter(
      event => new Date(event.date).toDateString() === date.toDateString()
    );

    if (dayEvents.length > 0) {
      trackFeatureUsage('event_tile_rendered', {
        date: date.toISOString(),
        eventCount: dayEvents.length,
        view: view
      });
      
      return (
        <div className="event-indicator">
          {dayEvents.map(event => (
            <div 
              key={event.id} 
              className="event-dot"
              style={{ backgroundColor: event.category?.color }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <div className="view-controls">
        <button 
          onClick={() => handleViewChange('monthly')}
          className={view === 'monthly' ? 'active' : ''}
        >
          Monthly
        </button>
        <button 
          onClick={() => handleViewChange('yearly')}
          className={view === 'yearly' ? 'active' : ''}
        >
          Yearly
        </button>
      </div>
      <Calendar
        onChange={handleDateClick}
        value={new Date()}
        view={view}
        tileContent={tileContent}
        className={`calendar-view ${view}`}
      />
    </div>
  );
};

export default CalendarView; 