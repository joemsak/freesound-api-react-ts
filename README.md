# Freesound API

A React + TypeScript application for searching and exploring sounds from Freesound.org. Built with Vite, React Router, and Tailwind CSS.

## Features

- 🔍 **Sound Search** - Search for sounds using the Freesound API
- 🎵 **Audio Preview** - Preview sounds directly in the browser with waveform visualization
- ⭐ **Favorites** - Save your favorite sounds to localStorage
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS
- 🔗 **Deep Linking** - Shareable URLs for individual sounds

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling
- **Freesound API** - Sound data and previews

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Freesound API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-ts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_FREESOUND_CLIENT_ID=your_client_id
VITE_FREESOUND_CLIENT_SECRET=your_client_secret
VITE_FREESOUND_API_TOKEN=your_api_token
```

### Getting Freesound API Credentials

1. Visit [Freesound.org](https://freesound.org)
2. Create an account or log in
3. Go to [API Access](https://freesound.org/apiv2/apply/) to apply for API access
4. Once approved, you'll receive:
   - Client ID
   - Client Secret
   - API Token (for direct API access)

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

Search for sounds using keywords, preview them with waveforms, and save favorites. Favorites are stored in localStorage and persist across sessions. Click any sound to view detailed information including duration, file size, license, and tags.

## Environment Variables

Required environment variables:
- `VITE_FREESOUND_CLIENT_ID` - Freesound API Client ID
- `VITE_FREESOUND_CLIENT_SECRET` - Freesound API Client Secret
- `VITE_FREESOUND_API_TOKEN` - Freesound API Token (recommended)

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Freesound.org](https://freesound.org) for providing the API and sound library
- Built with [React](https://react.dev) and [Vite](https://vite.dev)
