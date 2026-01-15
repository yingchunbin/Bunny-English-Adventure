
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Explicitly using process.cwd() from imported node process module to resolve TypeScript type errors.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for the existing code structure
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
      'process.env': {} 
    },
    server: {
      port: 3000,
    },
  };
});
