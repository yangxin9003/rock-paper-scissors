import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rock-paper-scissors/', // 设置为你的GitHub仓库名称
  server: {
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
