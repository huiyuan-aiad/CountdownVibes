import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Check if deploying to GitHub Pages
const isGitHubPages = process.env.GITHUB_ACTIONS || false;

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});