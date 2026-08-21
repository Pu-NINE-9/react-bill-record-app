import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './server',
  // 忽略测试文件，避免其被扫描为路由 / 自动导入，进而把 vitest 等测试依赖打进产物
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']
})
