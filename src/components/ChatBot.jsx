import { useState, useRef, useEffect, useContext } from 'react';
import { CountdownContext } from '../contexts/CountdownContext';
import { X, Send, MessageSquare, Calendar, Plus } from 'lucide-react';
import EventSearchResults from './EventSearchResults';
// Removed useApi import as the Ticketmaster toggle is no longer needed
// Added AbortSignal.timeout polyfill for browsers that don't support it
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function timeout(ms) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException('TimeoutError', 'TimeoutError')), ms);
    return controller.signal;
  };
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const { countdowns, addCountdown } = useContext(CountdownContext);
  // Removed useTicketmaster reference as AI will automatically determine when to use external tools
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, searchResults]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory([...chatHistory, { sender: 'user', text: message }]);
    setIsLoading(true);
    setSearchResults(null);
    
    try {
      // Check if message is about finding events
      const eventSearchTerms = ['find', 'search', 'look for', 'discover', 'show me', 'events', 'concerts', 'festivals', 'movie', 'movies', 'film', 'films', 'cinema', 'theater', 'theatre', 'show', 'shows', 'sports', 'game', 'games', 'match', 'matches'];
      const isEventSearch = eventSearchTerms.some(term => message.toLowerCase().includes(term));
      
      if (isEventSearch) { // Removed useTicketmaster check as AI will automatically determine when to use external tools
        // Check if the backend server is running
        let isBackendRunning = false;
        
        try {
          // Make a lightweight request to check if the backend is available
          const configCheck = await fetch('/api/eventSearch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ configCheck: true }),
            // Add a timeout to prevent long waiting times
            signal: AbortSignal.timeout(3000) // 3 second timeout
          });
          
          // If we get here without an error, the backend is running
          isBackendRunning = configCheck.ok;
          
          // Try to parse the response, but handle parsing errors gracefully
          let configData;
          try {
            configData = await configCheck.json();
            
            if (configData.error === 'API configuration error') {
              // API is not configured properly, inform the user
              setChatHistory(prev => [...prev, { 
                sender: 'ai', 
                text: 'I\'m sorry, but the event search feature is currently unavailable. The Ticketmaster API is not properly configured. Please try asking about your countdowns instead.' 
              }]);
              return; // Exit early
            }
          } catch (parseError) {
            console.error('Error parsing API response:', parseError);
            // Continue as we've already determined if the backend is running
          }
        } catch (error) {
          console.error('Error checking backend availability:', error);
          // Backend is not running or not responding
          isBackendRunning = false;
        }
        
        // If backend is not running, inform the user and exit early
        if (!isBackendRunning) {
          setChatHistory(prev => [...prev, { 
            sender: 'ai', 
            text: 'I\'m sorry, but the event search feature is currently unavailable. The backend server is not running. Please start the server with "npm run dev:full" or try asking about your countdowns instead.' 
          }]);
          return; // Exit early
        }
        
        // Extract location and event type from message
        let location = '';
        let query = '';
        let eventType = '';
        
        const msgLower = message.toLowerCase();
        
        // Extract event type
        const eventTypeMap = {
          'concert': 'music',
          'concerts': 'music',
          'music': 'music',
          'festival': 'music',
          'festivals': 'music',
          'movie': 'film',
          'movies': 'film',
          'film': 'film',
          'films': 'film',
          'cinema': 'film',
          'theater': 'arts',
          'theatre': 'arts',
          'play': 'arts',
          'art': 'arts',
          'arts': 'arts',
          'sports': 'sports',
          'sport': 'sports',
          'game': 'sports',
          'games': 'sports',
          'match': 'sports'
        };
        
        // Find event type in message
        for (const [term, type] of Object.entries(eventTypeMap)) {
          if (msgLower.includes(term)) {
            eventType = type;
            break;
          }
        }
        
        // Enhanced parsing logic for better query and location extraction
        if (msgLower.includes(' in ')) {
          const parts = msgLower.split(' in ');
          // Extract query by removing action words and keeping the main search term
          query = parts[0].replace(/find|search|look for|discover|show me/i, '').trim();
          location = parts[1].trim();
          
          // If query is just an event type, use it as both query and eventType
          if (query.match(/^(a |the )?(concert|movie|film|game|match|show|play)s?$/i)) {
            // Extract the core term without articles and pluralization
            const coreTerm = query.replace(/^(a |the )/i, '').replace(/s$/i, '');
            eventType = eventTypeMap[coreTerm.toLowerCase()] || eventType;
            query = coreTerm;
          }
        } else {
          query = message.replace(/find|search|look for|discover|show me/i, '').trim();
        }
        
        console.log(`Searching for: "${query}" in ${location || 'any location'} of type: ${eventType || 'any type'}`);
        
        try {
          // Search for events with timeout to prevent long waiting times
          const response = await fetch('/api/eventSearch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              query,
              location,
              eventType,
              startDate: new Date().toISOString() // Only search for future events
            }),
            signal: AbortSignal.timeout(15000) // Increased from 5000 to 15000 (15 seconds)
          });
          
          // Try to parse the response, but handle parsing errors gracefully
          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error('Error parsing search results:', parseError);
            throw new Error('Unable to process search results. The server may be unavailable.');
          }
          
          if (!response.ok) {
            if (data && data.error === 'API configuration error') {
              // Handle API configuration error specifically
              throw new Error('The event search feature is currently unavailable due to API configuration issues.');
            } else {
              throw new Error((data && data.error) || 'Failed to search events');
            }
          }
        
          if (data.events && data.events.length > 0) {
            // Add AI response to chat
            const eventTypeText = eventType ? ` ${eventType}` : '';
            const locationText = location ? ` in ${location}` : '';
            
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: `I found ${data.events.length}${eventTypeText} events${locationText} that might interest you:` 
            }]);
            
            // Set search results
            setSearchResults(data.events);
          } else {
            // No events found
            const eventTypeText = eventType ? ` ${eventType}` : '';
            const locationText = location ? ` in ${location}` : '';
            
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: `I couldn't find any${eventTypeText} events${locationText}${query ? ` matching "${query}"` : ''}. Please try a different search.` 
            }]);
          }
        } catch (error) {
          console.error('Error searching events:', error);
          // Check if it's a timeout error
          if (error.name === 'TimeoutError' || error.message.includes('timed out')) {
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: 'I\'m sorry, but the event search request timed out. The server might be busy or experiencing delays. Please try again later or try running the app with "npm run dev:full" to ensure the backend server is properly started.'
            }]);
          } else {
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: error.message || 'Sorry, I encountered an error searching for events. Please try again later.'
            }]);
          }
        }
      } else {
        // Regular chat message - send to Gemini AI
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              message,
              countdownContext: countdowns,
              isEventSearch: isEventSearch
            }),
            signal: AbortSignal.timeout(15000) // Increased from 5000 to 15000 (15 seconds)
          });
          
          // Try to parse the response, but handle parsing errors gracefully
          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error('Error parsing chat response:', parseError);
            throw new Error('Unable to process the response. The server may be unavailable.');
          }
          
          if (!response.ok) {
            throw new Error((data && data.error) || 'Failed to get response');
          }
          
          // Add AI response to chat
          setChatHistory(prev => [...prev, { sender: 'ai', text: data.response }]);
        } catch (error) {
          console.error('Error with chat API:', error);
          // Check if it's a timeout error
          if (error.name === 'TimeoutError' || error.message.includes('timed out')) {
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: 'I\'m sorry, but the request timed out. The server might be busy or experiencing delays. Please try again later or try running the app with "npm run dev:full" to ensure the backend server is properly started.'
            }]);
          }
          // Check if it's a network error (likely backend not running)
          else if (error.name === 'TypeError' || error.name === 'AbortError' || error.message.includes('server')) {
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: 'I\'m sorry, but I\'m currently unable to process your request. The backend server appears to be unavailable. Please start the server with "npm run dev:full" to enable full functionality.' 
            }]);
          } else {
            setChatHistory(prev => [...prev, { 
              sender: 'ai', 
              text: error.message || 'Sorry, I encountered an error processing your request. Please try again later.' 
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleAddEvent = async (event) => {
    try {
      // Check if the backend server is running
      let isBackendRunning = false;
      
      try {
        // Make a lightweight request to check if the backend is available
        const configCheck = await fetch('/api/eventSearch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ configCheck: true }),
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        // If we get here without an error, the backend is running
        isBackendRunning = configCheck.ok;
      } catch (error) {
        console.error('Error checking backend availability:', error);
        // Check if it's a timeout error
        if (error.name === 'TimeoutError' || error.message.includes('timed out')) {
          setChatHistory(prev => [...prev, { 
            sender: 'ai', 
            text: 'I\'m sorry, but the server request timed out. Please ensure the backend server is running with "npm run dev:full" and try again.'
          }]);
          return;
        }
        // Backend is not running
        isBackendRunning = false;
      }
      
      // If backend is not running, create a countdown directly without API call
      if (!isBackendRunning) {
        // Create a basic countdown object from the event
        const countdown = {
          id: crypto.randomUUID(), // Generate a random ID
          title: event.name,
          date: event.date,
          category: event.category || 'Event',
          color: getCategoryColor(event.category),
          notes: buildEventNotes(event),
          reminder: true,
          reminderDays: 1,
          image: event.image
        };
        
        // Add countdown to context
        addCountdown(countdown);
        
        // Add confirmation message to chat
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: `Great! I've added "${event.name}" to your countdowns. Note: I processed this locally since the backend server is not running.` 
        }]);
        
        // Clear search results
        setSearchResults(null);
        return;
      }
      
      // If backend is running, proceed with API call
      const response = await fetch('/api/addEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      // Try to parse the response, but handle parsing errors gracefully
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing addEvent response:', parseError);
        throw new Error('Unable to process the response. The server may be unavailable.');
      }
      
      if (!response.ok) {
        throw new Error((data && data.error) || 'Failed to add event');
      }
      
      // Add countdown to context
      addCountdown(data.countdown);
      
      // Add confirmation message to chat
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: `Great! I've added "${event.name}" to your countdowns.` 
      }]);
      
      // Clear search results
      setSearchResults(null);
    } catch (error) {
      console.error('Error adding event:', error);
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: error.message || 'Sorry, I encountered an error adding the event. Please try again.' 
      }]);
    }
  };
  
  // Helper function to get category color
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Music': '#FF5722',
      'Sports': '#2196F3',
      'Arts & Theatre': '#9C27B0',
      'Film': '#F44336',
      'Miscellaneous': '#607D8B',
      'Event': '#4CAF50'
    };
    
    return categoryColors[category] || '#4CAF50';
  };
  
  // Helper function to build event notes
  const buildEventNotes = (event) => {
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

  return (
    <div className="relative z-50">
      {/* Chat Toggle Button removed as it's now in the bottom navigation bar */}
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
          {/* Chat header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">CountdownVibes Assistant</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </div>
          
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 my-8">
                <p>Hi there! I'm your CountdownVibes assistant.</p>
                <p className="mt-2">Ask me about your countdowns or search for events!</p>
                <p className="mt-2 text-sm italic">
                  Try: "Find music festivals in London" or "Search for concerts in New York"
                </p>
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div 
                  key={index} 
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      chat.sender === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {chat.text}
                  </div>
                </div>
              ))
            )}
            
            {/* Event search results */}
            {searchResults && (
              <div className="mt-4">
                <EventSearchResults events={searchResults} onAddEvent={handleAddEvent} />
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200">
                  <div className="flex space-x-1">
                    <div className="animate-bounce">.</div>
                    <div className="animate-bounce delay-75">.</div>
                    <div className="animate-bounce delay-150">.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-700 p-3 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Search for events or ask a question..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-l-lg px-4 py-2 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-r-lg px-4 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;