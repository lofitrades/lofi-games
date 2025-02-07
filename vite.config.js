import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/lofi-games/", // Change this to your GitHub repository name
  plugins: [react()],

});
