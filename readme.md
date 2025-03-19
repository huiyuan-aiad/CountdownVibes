# Countdown Vibes

A modern, intuitive countdown application built with React and Vite that helps you track important events, deadlines, and celebrations.

## Features

- 🎯 **Event Tracking**: Create and manage multiple countdowns for various events
- 📊 **Category Management**: Organize events with customizable categories
- 📅 **Calendar View**: Visualize your events in a calendar format
- 🌓 **Dark/Light Mode**: Toggle between dark and light themes
- 🔔 **Notifications**: Get browser notifications for upcoming events
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd countdown-vibes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Usage

### Creating a Countdown

1. Click the "+" button on the home page
2. Fill in the event details:
   - Title (required)
   - Date (required)
   - Time (optional)
   - Category (select from existing or create custom)
   - Notes (optional)
   - Reminder settings (optional)

### Managing Categories

1. Access category management through the Settings page
2. View all available categories
3. Create custom categories with custom colors
4. Delete unused custom categories (predefined categories cannot be deleted)

### Calendar View

- Click the calendar icon in the header to view events in calendar format
- Events are marked with category-colored dots
- Click on any date to view events scheduled for that day

### Settings

Access the settings page to:
- Toggle dark/light mode
- Manage notification preferences
- Manage categories
- View app information

## Tech Stack

- React 18
- Vite
- React Router DOM
- TailwindCSS
- date-fns
- UUID

## Project Structure

```
countdown-vibes/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (theme, countdown)
│   ├── pages/         # Page components
│   └── App.jsx        # Main application component
├── public/            # Static assets
└── index.html        # Entry HTML file
```

## Features in Detail

### Categories
- Predefined categories: Celebrations, Milestones, Deadlines
- Custom categories with color selection
- Category filtering on the home page

### Countdown Display
- Days, hours, minutes, and seconds
- Visual indicators for category types
- Notes and reminder information

### Data Persistence
- All data is stored in localStorage
- Automatic saving of countdowns and categories
- Persistent theme preference

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Version

Current version: 0.1.0



