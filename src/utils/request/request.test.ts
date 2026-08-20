import { describe, expect, it } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import instance from './request'

function jsonAdapter(
  data: unknown,
  status = 200
): (config: InternalAxiosRequestConfig) => Promise<AxiosResponse> {
  return async (config) => ({
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config
  })
}

describe('request 实例', () => {
  it('使用 VITE_BASE_URL 作为 baseURL，超时时间为10s', () => {
    expect(instance.defaults.baseURL).toBe('/api')
    expect(instance.defaults.timeout).toBe(10000)
  })

  it('响应拦截器：code===200 时直接返回 data.data（剥壳）', async () => {
    const result = await instance.request({
      url: '/any',
      adapter: jsonAdapter({ code: 200, data: { foo: 'bar', list: [1, 2] } })
    })
    expect(result).toEqual({ foo: 'bar', list: [1, 2] })
  })

  it('响应拦截器：code!==200 时 reject 整个响应体', async () => {
    await expect(
      instance.request({
        url: '/any',
        adapter: jsonAdapter({ code: 0, message: '缺少参数' })
      })
    ).rejects.toEqual({ code: 0, message: '缺少参数' })
  })

  it('请求拦截器透传 config，url 与 baseURL 正确合并', async () => {
    let captured: InternalAxiosRequestConfig | undefined
    await instance.request({
      url: '/test',
      adapter: async (config) => {
        captured = config
        return {
          data: { code: 200, data: 'ok' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        }
      }
    })
    expect(captured?.url).toBe('/test')
    expect(captured?.baseURL).toBe('/api')
  })
})
