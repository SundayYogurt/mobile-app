import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Enable React JSX transform and HMR via @vitejs/plugin-react
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
