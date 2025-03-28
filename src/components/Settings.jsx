import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailReminders: true,
    pushNotifications: false,
    smsReminders: false,
    reminderTime: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data().settings || settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { settings }, { merge: true });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Reminder Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="emailReminders"
              checked={settings.emailReminders}
              onChange={handleChange}
              className="rounded text-indigo-600"
            />
            <span>Email Reminders</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
              className="rounded text-indigo-600"
            />
            <span>Push Notifications</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="smsReminders"
              checked={settings.smsReminders}
              onChange={handleChange}
              className="rounded text-indigo-600"
            />
            <span>SMS Reminders</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Default Reminder Time
          </label>
          <input
            type="time"
            name="reminderTime"
            value={settings.reminderTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Timezone
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings; 