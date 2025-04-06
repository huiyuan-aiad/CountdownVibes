import { createContext, useState, useContext, useEffect } from 'react';

export const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const [useTicketmaster, setUseTicketmaster] = useState(false); // Disabled by default

  // Load preference from localStorage on initial render
  useEffect(() => {
    const savedPreference = localStorage.getItem('useTicketmaster');
    if (savedPreference !== null) {
      setUseTicketmaster(savedPreference === 'true');
    }
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('useTicketmaster', useTicketmaster.toString());
  }, [useTicketmaster]);

  // Toggle Ticketmaster API usage
  const toggleTicketmaster = () => {
    setUseTicketmaster(prev => !prev);
  };

  return (
    <ApiContext.Provider value={{ useTicketmaster, toggleTicketmaster }}>
      {children}
    </ApiContext.Provider>
  );
};