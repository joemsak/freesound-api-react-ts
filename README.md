# Freesound API Client

A modern React + TypeScript application for searching and exploring sounds from Freesound.org. Built with Vite, React Router, and Tailwind CSS.

## Features

- 🔍 **Sound Search** - Search for sounds using keywords with pagination
- 🎵 **Audio Preview** - Preview sounds directly in the browser with waveform visualization
- 🎧 **Fixed Audio Player** - SoundCloud-style fixed footer player that persists across navigation
- ⭐ **Favorites** - Save your favorite sounds with persistent localStorage storage
- 👤 **User Profiles** - Browse sounds uploaded by specific users
- 🏷️ **Tag Search** - Discover sounds by tags
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS
- 🔗 **Deep Linking** - Shareable URLs for individual sounds, users, and tags
- 💾 **Smart Caching** - Automatic caching of search results and sound data (5-minute TTL)
- ⚡ **Rate Limiting** - Built-in rate limiter to prevent API throttling
- 🎯 **Single Audio Playback** - Only one audio plays at a time across the application

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling
- **Freesound API** - Sound data and previews

## Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── AudioPlayer.tsx
│   ├── FixedAudioPlayer.tsx
│   ├── SoundCard.tsx
│   ├── SoundTitle.tsx
│   └── ...
├── screens/          # Page-level components
│   ├── Home.tsx
│   ├── FreesoundSearch.tsx
│   ├── SoundDetail.tsx
│   ├── UserProfile.tsx
│   └── TagSearch.tsx
├── contexts/         # React Context providers
│   ├── AudioPlayerContext.tsx
│   ├── FavoritesContext.tsx
│   └── SoundCacheContext.tsx
├── hooks/            # Custom React hooks
│   ├── useAsyncEffect.ts
│   ├── useCachedSearch.ts
│   ├── useDocumentTitle.ts
│   └── usePaginatedSearch.ts
├── services/         # API clients
│   └── freesound.ts
└── utils/            # Utility functions
    ├── errorHandler.ts
    ├── rateLimiter.ts
    └── url.ts
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Freesound API credentials

### Installation

1. Clone the repository:

```bash
git clone git@github.com:joemsak/freesound-api-react-ts.git
cd freesound-api-react-ts
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

### Development

Start the dev server with HMR:

```bash
vite dev
```

The app will be available at `http://localhost:5173` (Vite's default port).

### Build

Build for production (outputs to `dist/`):

```bash
vite build
```

### Preview

Preview the production build locally:

```bash
vite preview
```

## Usage

### Home Page

- Search for sounds using the search bar
- Discover "Sound of the Day" - a randomly selected sound
- Browse "New Sounds" - latest uploads from Freesound

### Search

- Enter keywords in the search bar (available in navigation or home page)
- Browse paginated results with numbered pagination
- Click any sound card to view details
- Click usernames to view their profile
- Click tags to search for sounds with that tag

### Sound Details

- View full sound information including metadata, description, and tags
- Preview audio with waveform visualization
- Add to favorites
- Navigate to uploader's profile
- View on Freesound.org

### Favorites

- Click the star icon on any sound to add it to favorites
- Access favorites via the sidebar (toggle button in navigation)
- Favorites persist across sessions using localStorage
- Play favorites directly from the sidebar

### Fixed Audio Player

- Audio continues playing when navigating between pages
- Fixed footer player shows current track information
- Control playback from any page
- Add/remove favorites directly from the player

## Architecture Highlights

### Caching Strategy

- Search results and sound data are cached for 5 minutes
- Cache persists across page reloads using localStorage
- Automatic cache expiration and cleanup
- Reduces API calls and improves performance

### Rate Limiting

- Built-in client-side rate limiter prevents API throttling
- Respects Freesound API limits (60 requests/minute, 2000/day)
- Queues requests and introduces delays when needed

### Single Audio Playback

- Global audio player context ensures only one track plays at a time
- Automatically pauses previous track when new one starts
- Synchronized playback state across components

### Component Organization

- **Components**: Reusable UI elements (buttons, cards, players)
- **Screens**: Page-level components (Home, Search, Detail)
- **Contexts**: Global state management (favorites, cache, audio)
- **Hooks**: Reusable logic (caching, pagination, async effects)

## Environment Variables

Required environment variables:
- `VITE_FREESOUND_CLIENT_ID` - Freesound API Client ID
- `VITE_FREESOUND_CLIENT_SECRET` - Freesound API Client Secret
- `VITE_FREESOUND_API_TOKEN` - Freesound API Token (recommended for better rate limits)

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Freesound.org](https://freesound.org) for providing the API and sound library
- Built with [React](https://react.dev) and [Vite](https://vite.dev)
