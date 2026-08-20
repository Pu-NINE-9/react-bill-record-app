/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      viteMockServe({
        mockPath: 'mock', // 根目录mock文件夹
        // 开发环境开启mock；测试环境(VITEST)关闭，避免 mock server 与文件监听器阻止进程退出
        enable: command === 'serve' && !process.env.VITEST,
        watchFiles: command === 'serve' && !process.env.VITEST, // mock文件修改自动热更新
        logger: true // 控制台打印mock接口日志
      })
    ],
    test: {
      globals: true, // 全局可用 describe、it、expect，不用每次import
      environment: 'jsdom', // 模拟浏览器DOM环境
      setupFiles: './src/test/setup.ts', // 测试前置初始化文件
      exclude: ['node_modules', 'dist'],
      css: true
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src')
        },
        {
          find: '@hooks',
          replacement: path.resolve(__dirname, 'src/hooks')
        },
        {
          find: '@pages',
          replacement: path.resolve(__dirname, 'src/pages')
        }
      ]
    }
  }
})
