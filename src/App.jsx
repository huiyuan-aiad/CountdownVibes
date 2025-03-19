import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddCountdownPage from './pages/AddCountdownPage';
import CountdownDetailPage from './pages/CountdownDetailPage';
import CalendarViewPage from './pages/CalendarViewPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { CountdownProvider } from './contexts/CountdownContext';

function App() {
  return (
    <ThemeProvider>
      <CountdownProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddCountdownPage />} />
            <Route path="/edit/:id" element={<AddCountdownPage />} />
            <Route path="/countdown/:id" element={<CountdownDetailPage />} />
            <Route path="/calendar" element={<CalendarViewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </CountdownProvider>
    </ThemeProvider>
  );
}

export default App;