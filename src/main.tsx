import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SoundCacheProvider } from './contexts/SoundCacheContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import './index.css'
import App from './App.tsx'

// Handle GitHub Pages SPA routing
// https://github.com/rafgraph/spa-github-pages
const pathSegmentsToKeep = 1;
const l = window.location;
if (l.pathname.includes('/?/')) {
  const pathname = l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/~and~/g, '&');
  const search = l.search.slice(1).replace(/~and~/g, '&');
  const hash = l.hash;
  const newPath = '/' + pathname + (search ? '?' + search : '') + hash;
  window.history.replaceState({}, '', newPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
