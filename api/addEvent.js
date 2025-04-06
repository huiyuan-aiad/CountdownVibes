import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event } = req.body;
    
    if (!event || !event.name || !event.date) {
      return res.status(400).json({ error: 'Invalid event data' });
    }
    
    // Build detailed notes with all available information
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
    
    // Convert external event to countdown format
    const countdown = {
      id: uuidv4(),
      title: event.name,
      date: event.date,
      category: event.category || 'Event',
      color: getCategoryColor(event.category),
      notes: notes.trim(),
      reminder: true,
      reminderDays: 1,
      image: event.image
    };
    
    return res.status(200).json({ countdown });
  } catch (error) {
    console.error('Error converting event:', error);
    return res.status(500).json({ error: 'Failed to convert event', details: error.message });
  }
}

// Helper function to assign colors based on category
function getCategoryColor(category) {
  const categoryColors = {
    'Music': '#FF5722',
    'Sports': '#2196F3',
    'Arts & Theatre': '#9C27B0',
    'Film': '#F44336',
    'Miscellaneous': '#607D8B',
    'Event': '#4CAF50'
  };
  
  return categoryColors[category] || '#4CAF50';
}