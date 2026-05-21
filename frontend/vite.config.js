import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // We can run the frontend on port 3000 so it doesn't clash with backend 5000
    host: true
  }
});
