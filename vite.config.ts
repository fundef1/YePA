import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path for deployment to GitHub Pages.
  // This ensures all asset URLs (images, CSS, JS) are correctly prefixed.
  base: '/YePA/', 
});