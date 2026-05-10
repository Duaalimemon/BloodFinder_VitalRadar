import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base:'/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: [
        "blood-finder-dua.loca.lt", // Purana local link (rehne dein bhale)
        "duaa23-vitalradar.hf.space" // Naya Hugging Face link (Bina https:// ke)
      ],
      // ... baqi settings
    },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
