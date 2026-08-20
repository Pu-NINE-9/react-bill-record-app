import { useState, useEffect, useRef, useCallback } from 'react'
import instance from '@/utils/request'
import type { AxiosRequestConfig } from 'axios'

/**
 * @param url 请求地址
 * @param method 请求方式
 * @param params get查询参数
 * @param data post请求体
 * @param extraConfig axios高级配置
 * @param autoRun 是否组件挂载自动执行，默认true
 */
export default function useRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  params?: Record<string, unknown>,
  data?: Record<string, unknown>,
  extraConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'params' | 'data'>,
  autoRun = true
) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [res, setRes] = useState<T | null>(null)

  const unmountRef = useRef(false)

  const run = useCallback(
    async (override?: { params?: Record<string, unknown>; data?: Record<string, unknown> }) => {
      if (unmountRef.current) return null

      setLoading(true)
      setError(null)
      let result: T | null = null

      try {
        // 拦截器已经剥壳，直接拿到业务T，不要再 .data
        result = (await instance.request<T>({
          url,
          method,
          params: { ...params, ...override?.params },
          data: { ...data, ...override?.data },
          ...extraConfig
        })) as unknown as T
        if (!unmountRef.current) setRes(result)
      } catch (err) {
        if (!unmountRef.current) {
          setError(err as Error)
          console.error('useRequest 请求异常：', err)
        }
      } finally {
        if (!unmountRef.current) setLoading(false)
      }
      console.log('接口返回业务result：', result)
      return result
    },
    [url, method, params, data, extraConfig]
  )

  useEffect(() => {
    unmountRef.current = false
    if (autoRun) setTimeout(() => run(), 0)
    return () => {
      unmountRef.current = true
    }
  }, [run, autoRun])

  return {
    loading,
    error,
    res,
    run
  }
}
