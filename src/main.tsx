import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SoundCacheProvider } from './contexts/SoundCacheContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SoundCacheProvider>
        <FavoritesProvider>
          <AudioPlayerProvider>
            <App />
          </AudioPlayerProvider>
        </FavoritesProvider>
      </SoundCacheProvider>
    </BrowserRouter>
  </StrictMode>,
)
