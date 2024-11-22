import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/php': {
        target: 'https://marimo.idv.tw', // 指向WAMP伺服器
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/php/, '/php'),
      },
      '/post_picture': {
        target: 'https://marimo.idv.tw', // 指向WAMP伺服器
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/post_picture/, '/post_picture'),
      },
    },
  },
});
