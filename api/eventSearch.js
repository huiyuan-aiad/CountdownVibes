export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if this is a configuration check request
    if (req.body.configCheck) {
      // Check for API key
      const apiKey = process.env.TICKETMASTER_API_KEY;
      if (!apiKey) {
        console.error('Ticketmaster API key is missing');
        return res.status(500).json({ error: 'API configuration error' });
      }
      return res.status(200).json({ configured: true });
    }
    
    const { query, location, eventType, startDate, endDate } = req.body;
    
    // Check for API key
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      console.error('Ticketmaster API key is missing');
      return res.status(500).json({ error: 'API configuration error' });
    }
    
    // Ticketmaster Discovery API endpoint
    const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    
    // Build query parameters
    const params = new URLSearchParams({
      apikey: apiKey,
      keyword: query,
      size: 20, // Increased result limit
      sort: 'date,asc', // Sort by date ascending
    });
    
    console.log(`Searching for events with query: "${query}" in location: "${location || 'any'}"${eventType ? ` of type: ${eventType}` : ''}`);
    
    // Add location parameters
    if (location) {
      // Try to handle both city names and city,state format
      if (location.includes(',')) {
        const [city, state] = location.split(',').map(part => part.trim());
        params.append('city', city);
        if (state && state.length === 2) {
          params.append('stateCode', state.toUpperCase());
        }
      } else {
        params.append('city', location.trim());
      }
    }
    
    // Add event type/classification filter
    if (eventType) {
      // Map common terms to Ticketmaster segment names
      const segmentMap = {
        'music': 'Music',
        'concert': 'Music',
        'concerts': 'Music',
        'sports': 'Sports',
        'sport': 'Sports',
        'game': 'Sports',
        'games': 'Sports',
        'art': 'Arts & Theatre',
        'arts': 'Arts & Theatre',
        'theatre': 'Arts & Theatre',
        'theater': 'Arts & Theatre',
        'play': 'Arts & Theatre',
        'movie': 'Film',
        'film': 'Film',
        'cinema': 'Film'
      };
      
      const segment = segmentMap[eventType.toLowerCase()];
      if (segment) {
        params.append('segmentName', segment);
      }
    }
    
    // Add date range parameters
    if (startDate) {
      const startDateTime = new Date(startDate);
      // Ensure valid date
      if (!isNaN(startDateTime.getTime())) {
        // Format date as YYYY-MM-DDTHH:mm:ssZ (Ticketmaster required format)
        const formattedDate = startDateTime.toISOString().split('.')[0] + 'Z';
        params.append('startDateTime', formattedDate);
      }
    } else {
      // Default to current date if no start date provided
      const now = new Date();
      const formattedDate = now.toISOString().split('.')[0] + 'Z';
      params.append('startDateTime', formattedDate);
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      // Ensure valid date
      if (!isNaN(endDateTime.getTime())) {
        // Format date as YYYY-MM-DDTHH:mm:ssZ (Ticketmaster required format)
        const formattedDate = endDateTime.toISOString().split('.')[0] + 'Z';
        params.append('endDateTime', formattedDate);
      }
    }
    
    // Make request to Ticketmaster API
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ticketmaster API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Error from Ticketmaster API', 
        details: errorText
      });
    }
    
    const data = await response.json();
    
    // Format the response
    let events = [];
    if (data._embedded && data._embedded.events) {
      events = data._embedded.events.map(event => {
        // Extract venue information
        const venue = event._embedded?.venues?.[0] || {};
        const location = [
          venue.name,
          venue.city?.name,
          venue.state?.stateCode,
          venue.country?.name
        ].filter(Boolean).join(', ');
        
        // Get best image
        const bestImage = event.images?.find(img => img.ratio === '16_9' && img.width > 500)?.url || 
                         event.images?.find(img => img.width > 500)?.url ||
                         event.images?.[0]?.url;
        
        // Format price range if available
        let priceRange = '';
        if (event.priceRanges && event.priceRanges.length > 0) {
          const range = event.priceRanges[0];
          priceRange = `${range.min}-${range.max} ${range.currency}`;
        }
        
        return {
          id: event.id,
          name: event.name,
          date: event.dates.start.dateTime,
          localDate: event.dates.start.localDate,
          localTime: event.dates.start.localTime,
          venue: venue.name || 'Unknown venue',
          city: venue.city?.name || 'Unknown city',
          state: venue.state?.stateCode,
          country: venue.country?.name || 'Unknown country',
          location,
          image: bestImage,
          url: event.url,
          category: event.classifications?.[0]?.segment?.name || 'Event',
          genre: event.classifications?.[0]?.genre?.name,
          subGenre: event.classifications?.[0]?.subGenre?.name,
          priceRange
        };
      });
    }
    
    // Include pagination info if available
    const pagination = data.page ? {
      totalElements: data.page.totalElements,
      totalPages: data.page.totalPages,
      size: data.page.size,
      number: data.page.number
    } : null;
    
    return res.status(200).json({ 
      events,
      pagination,
      _links: data._links
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return res.status(500).json({ error: 'Failed to search events', details: error.message });
  }
}