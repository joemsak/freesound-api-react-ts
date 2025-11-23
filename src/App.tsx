import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { FreesoundSearch } from './components/FreesoundSearch';
import { SoundDetail } from './components/SoundDetail';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { Navigation } from './components/Navigation';

function App() {
  // Access environment variables using import.meta.env
  const clientId = import.meta.env.VITE_FREESOUND_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_FREESOUND_CLIENT_SECRET;
  const hasCredentials = !!(clientId && clientSecret);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* App-wide Navigation */}
      <Navigation
        onToggleFavorites={() => setSidebarOpen(!sidebarOpen)}
        favoritesOpen={sidebarOpen}
      />

      {/* Main Content Area - with conditional right margin for sidebar */}
      <div className={`py-8 transition-all ${sidebarOpen ? 'md:pr-96' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">Freesound API Demo</h1>
            <p className="text-gray-700">
              Search and preview sounds from Freesound.org
            </p>
          </div>

          {/* Credentials Status */}
          {!hasCredentials && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg">
              <p className="font-semibold">⚠️ Missing API Credentials</p>
              <p className="text-sm mt-1">
                Please ensure VITE_FREESOUND_CLIENT_ID and VITE_FREESOUND_CLIENT_SECRET are set in your .env file
              </p>
            </div>
          )}

          {/* Routes */}
          <Routes>
            <Route path="/" element={<FreesoundSearch />} />
            <Route path="/sound/:soundId" element={<SoundDetail />} />
          </Routes>
        </div>
      </div>

      {/* Favorites Sidebar */}
      <FavoritesSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}

export default App
