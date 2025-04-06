import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, countdownContext, isEventSearch } = req.body;
    
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the newer Gemini 2.0 Flash model for improved performance
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create a prompt that includes countdown context
    let prompt = message;
    
    if (isEventSearch) {
      // Handle event search requests when Ticketmaster API is disabled
      prompt = `The user is asking about events: "${message}". Please provide a helpful response about these types of events. Do not claim to search any real database, but provide general information about such events and suggest the user to check official websites or enable the Ticketmaster API in settings for real event data.`;
    } else if (countdownContext && countdownContext.length > 0) {
      prompt = `I have the following countdowns: ${JSON.stringify(countdownContext)}. ${message}`;
    }
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}