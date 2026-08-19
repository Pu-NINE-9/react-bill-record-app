import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/user',
    method: 'get',
    timeout: 200, // 模拟网络延迟
    response: () => {
      return {
        code: 200,
        data: [{ id: 1 }, { id: 2 }, { id: 3 }]
      }
    }
  }
] as MockMethod[]
