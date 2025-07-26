import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false, // Disable strict file serving restrictions
      allow: ['/mnt/g/www/bookmarks-manager', './']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5015',
        changeOrigin: true,
        secure: false,
      }
    },
    // Ensure all routes fallback to index.html for SPA routing
    historyApiFallback: true
  }
});
