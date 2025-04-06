import { Calendar, MapPin, Plus, Clock, Tag, DollarSign } from 'lucide-react';

const EventSearchResults = ({ events, onAddEvent }) => {
  if (!events || events.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div 
          key={event.id}
          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 transition-all hover:shadow-lg"
        >
          {event.image && (
            <div className="h-32 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-3">
            <h4 className="font-medium text-gray-900 dark:text-white">{event.name}</h4>
            
            <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(event.date)}</span>
              {event.localTime && (
                <>
                  <span className="mx-1">•</span>
                  <Clock size={14} className="mr-1" />
                  <span>{formatTime(event.localTime)}</span>
                </>
              )}
            </div>
            
            <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin size={14} className="mr-1" />
              <span className="truncate">{event.location || `${event.venue}, ${event.city}`}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {event.category && (
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  <Tag size={12} className="mr-1" />
                  {event.category}
                </div>
              )}
              
              {event.genre && event.genre !== event.category && (
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {event.genre}
                </div>
              )}
              
              {event.priceRange && (
                <div className="flex items-center text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                  <DollarSign size={12} className="mr-1" />
                  {event.priceRange}
                </div>
              )}
            </div>
            
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => onAddEvent(event)}
                className="flex items-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
              >
                <Plus size={14} className="mr-1" />
                Add to Countdowns
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventSearchResults;