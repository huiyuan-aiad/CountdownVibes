import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { trackCountdownCreated, trackReminderSet, trackError } from '../utils/analytics';

const CountdownForm = ({ onSubmit, categories }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [hasReminder, setHasReminder] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const newCountdown = {
        id: uuidv4(),
        title,
        date,
        category,
        hasReminder,
        notes
      };
      
      onSubmit(newCountdown);
      
      // Track the countdown creation
      trackCountdownCreated(category);
      
      // Track if a reminder was set
      if (hasReminder) {
        const daysUntilEvent = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        trackReminderSet(daysUntilEvent);
      }

      // Reset form
      setTitle('');
      setDate('');
      setCategory('');
      setHasReminder(false);
      setNotes('');
    } catch (error) {
      trackError('form_submission', error.message);
      console.error('Error creating countdown:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="countdown-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={hasReminder}
            onChange={(e) => setHasReminder(e.target.checked)}
          />
          Set Reminder
        </label>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit">Create Countdown</button>
    </form>
  );
};

export default CountdownForm; 