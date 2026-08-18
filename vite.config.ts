import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // 全局可用 describe、it、expect，不用每次import
    environment: 'jsdom', // 模拟浏览器DOM环境
    setupFiles: './src/test/setup.ts', // 测试前置初始化文件
    exclude: ['node_modules', 'dist'],
    css: true
  }
})
