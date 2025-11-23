import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './screens/Home';
import { FreesoundSearch } from './screens/FreesoundSearch';
import { SoundDetail } from './screens/SoundDetail';
import { UserProfile } from './screens/UserProfile';
import { TagSearch } from './screens/TagSearch';
import { FavoritesSidebar } from './components/FavoritesSidebar';
import { Navigation } from './components/Navigation';
import { FixedAudioPlayer } from './components/FixedAudioPlayer';

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

      {/* Main Content Area - with conditional right margin for sidebar and bottom padding for fixed player */}
      <div className={`py-8 pb-24 transition-all ${sidebarOpen ? 'md:pr-96' : ''}`}>
        <div className="container mx-auto px-4">
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
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<FreesoundSearch />} />
            <Route path="/sound/:soundId" element={<SoundDetail />} />
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/tag/:tagName" element={<TagSearch />} />
          </Routes>
        </div>
      </div>

      {/* Favorites Sidebar */}
      <FavoritesSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Fixed Audio Player Footer */}
      <FixedAudioPlayer />
    </div>
  );
}

export default App
