/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { nitro } from 'nitro/vite' // 扩充后端能力
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  // TODO: 插件
  plugins: [
    react(),
    tailwindcss(),
    // Nitro 后端：测试环境(VITEST)下关闭，避免其 dev 环境/文件监听阻止测试进程退出
    ...(process.env.VITEST ? [] : nitro()),
    compression({
      // 同时生成 gzip + br 两种压缩包
      algorithms: ['gzip', 'br'],
      threshold: 1024,
      // 图片、字体跳过压缩
      exclude: /\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/,
      logLevel: 'silent',
      skipIfLargerOrEqual: true,
      deleteOriginalAssets: false
    })
  ],
  // TODO: 测试相关
  test: {
    globals: true, // 全局可用 describe、it、expect，不用每次import
    environment: 'jsdom', // 模拟浏览器DOM环境
    setupFiles: './src/test/setup.ts', // 测试前置初始化文件
    exclude: ['node_modules', 'dist'],
    css: true,
    // vitest 优化：关闭不必要监控，加速测试
    watch: false,
    // 限制并发，避免nitro/h3文件干扰
    pool: 'threads'
  },
  // TODO: 别名配置
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(import.meta.dirname, 'src')
      },
      {
        find: '@hooks',
        replacement: path.resolve(import.meta.dirname, 'src/hooks')
      },
      {
        find: '@pages',
        replacement: path.resolve(import.meta.dirname, 'src/pages')
      }
    ]
  },
  // TODO: build相关
  build: {
    // 生产构建不生成 sourcemap，减小体积、避免源码泄露
    sourcemap: false,
    // antd-mobile 等库较大，提高告警阈值避免误报
    chunkSizeWarningLimit: 1500
  },
  // TODO: 客户端相关
  environments: {
    client: {
      build: {
        minify: 'terser',
        terserOptions: {
          // TODO: 1.js代码优化配置
          compress: {
            drop_console: true, // 移除console
            drop_debugger: true, // 移除debugger
            // 移除特定的console方法
            pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error'],
            dead_code: true, // 移除死代码
            conditionals: true, // 简化条件判断
            evaluate: true, // 计算常量表达式
            sequences: true, // 合并连续语句
            booleans: true, // 优化布尔表达式
            unused: true, // 移除未使用的变量
            comparisons: true, // 优化比较表达式
            if_return: true, // 优化if-return语句
            join_vars: true // 合并变量声明
          },
          // TODO: 2.移除所有注释
          format: {
            comments: false
          }
        },
        // TODO: 资源优化配置
        assetsInlineLimit: 4096, // 小于4kb的资源转为base64
        // TODO: CSS部分
        // 提取CSS为单独文件
        cssCodeSplit: true,
        // 启用CSS压缩
        cssMinify: 'lightningcss',
        rollupOptions: {
          output: {
            // 按依赖维度拆分 vendor chunk，利于浏览器长期缓存（仅作用于前端 client 环境）
            manualChunks(id: string) {
              if (!id.includes('node_modules')) return
              if (id.includes('antd-mobile')) return 'antd-mobile-vendor'
              if (id.includes('react-router') || id.includes('react-dom')) return 'react-vendor'
              if (id.includes('i18next')) return 'i18n-vendor'
              if (id.includes('axios')) return 'http-vendor'
              if (/[\\/]react[\\/]/.test(id)) return 'react-vendor'
            }
          }
        }
      }
    }
  }
})
