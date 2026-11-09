import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        catalog: resolve(projectRoot, 'pages/catalog.html'),
        property: resolve(projectRoot, 'pages/property.html'),
        favorites: resolve(projectRoot, 'pages/favorites.html'),
        compare: resolve(projectRoot, 'pages/compare.html'),
        aiSearch: resolve(projectRoot, 'pages/ai-search.html'),
        profile: resolve(projectRoot, 'pages/profile.html'),
        login: resolve(projectRoot, 'pages/login.html'),
        createListing: resolve(projectRoot, 'pages/create-listing.html'),
        valuation: resolve(projectRoot, 'pages/valuation.html')
      }
    }
  }
});
