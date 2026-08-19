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
        enable: command === 'serve', // 开发环境开启mock
        watchFiles: true, // mock文件修改自动热更新
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
        }
      ]
    }
  }
})
