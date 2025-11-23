import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // For GitHub Pages: use repo name as base path
  // For custom domain or other hosting: set base to '/'
  base: process.env.NODE_ENV === 'production' ? '/freesound-api-react-ts/' : '/',
})
