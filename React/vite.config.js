import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rmSync } from 'fs';


export default defineConfig({
  plugins: [
    react(),
    // 在構建開始前清空 ../assets 文件夾
    {
      name: 'clear-assets',
      apply: 'build',
      buildStart() {
        rmSync('../assets', { recursive: true, force: true });
      },
    },
  ],
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
  build: {
    // 構建於 ../
    outDir: '../',
    emptyOutDir: false,
  },
});
