import react from '@vitejs/plugin-react';
import { transformWithEsbuild, defineConfig } from 'vite';

export default defineConfig({
  root: './', // Set root to the current directory assuming vite.config.js is in the project root
  publicDir: 'public', // Adjusted to directly refer to the public directory within the frontend directory
  base: './',
  plugins: [
    react(),
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.endsWith('.js')) return null; // Simplified check for .js files in the src directory
        return await transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
  ],
  server: {
    host: true,
    open: true, // Simplified to just true for local development
  },
  build: {
    outDir: 'dist', // Simplified to directly refer to the dist directory within the frontend directory
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/path/to/frontend/src', // Ensure this path is correctly pointing to your src directory
    },
  },
});
