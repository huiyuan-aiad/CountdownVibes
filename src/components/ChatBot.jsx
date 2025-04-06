import { useState, useRef, useEffect, useContext } from 'react';
import { CountdownContext } from '../contexts/CountdownContext';
import { X, Send, MessageSquare, Calendar, Plus } from 'lucide-react';
import EventSearchResults from './EventSearchResults';
import { useApi } from '../contexts/ApiContext';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const { countdowns, addCountdown } = useContext(CountdownContext);
  const { useTicketmaster } = useApi();
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
      
      if (isEventSearch && useTicketmaster) {
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
        
        // Search for events
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
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to search events');
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
      } else {
        // Regular chat message - send to Gemini AI
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message,
            countdownContext: countdowns,
            isEventSearch: isEventSearch && !useTicketmaster // Pass flag if it's an event search but Ticketmaster is disabled
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }
        
        // Add AI response to chat
        setChatHistory(prev => [...prev, { sender: 'ai', text: data.response }]);
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
      // Convert event to countdown format
      const response = await fetch('/api/addEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add event');
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
        text: 'Sorry, I encountered an error adding the event. Please try again.' 
      }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all duration-300"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>
      
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
                  {useTicketmaster 
                    ? "Try: \"Find music festivals in London\" or \"Search for concerts in New York\"" 
                    : "Ask me anything about your countdowns or upcoming events!"}
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
              placeholder={useTicketmaster 
                ? "Search for events or ask a question..." 
                : "Ask me a question..."}
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