import { defineConfig } from 'vite';

export default defineConfig({
  base: '/石头剪刀布/', // 设置为你的GitHub仓库名称
  server: {
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
