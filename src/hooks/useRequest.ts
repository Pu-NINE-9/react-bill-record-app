import { useState, useEffect, useRef, useCallback } from 'react'
import instance from '@/utils/request'
import type { AxiosRequestConfig } from 'axios'

/**
 * @param url 请求地址
 * @param config axios配置 {method,params,data}
 * @param autoRun 是否组件挂载自动执行，默认true
 */
export default function useRequest<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  params?: Record<string, any>,
  data?: Record<string, any>,
  /** 剩余完整axios高级配置 */
  extraConfig?: Omit<AxiosRequestConfig, 'url'|'method'|'params'|'data'>,
  autoRun = true
) {
  // 基本状态设置
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [res, setRes] = useState<T | null>(null)

  // 封装组件卸载标记
  const unmountRef = useRef(false)

  // 封装缓存函数，提升性能，手动执行请求
  const run = useCallback(async () => {
    if (unmountRef.current) return

    setLoading(true)
    setError(null)

    try {
      const result = await instance.request<T>({
        url,
        method,
        params,
        data,
        ...extraConfig
      })
      // 没卸载才更新state
      if (!unmountRef.current) setRes(result as T)
    } catch (err) {
      if (!unmountRef.current) {
        setError(err as Error)
        console.error('useRequest 请求异常：', err)
      }
    } finally {
      if (!unmountRef.current) setLoading(false)
    }
  }, [url, method, params, data, extraConfig])

  // 挂载、依赖变化、卸载时执行
  useEffect(() => {
    unmountRef.current = false

    if (autoRun) setTimeout(() => run(), 0) // 把执行放到 effect 同步流程之外

    // 组件卸载触发
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

/**
 * TODO: 使用示例
 * interface BillItem {
 *   id: number
 *   amount: number
 *   remark: string
 * }
 * export default function BillList() {
 *   const { loading, res, error } = useRequest<BillItem[]>('/bill/list', {
 *     method: 'get',
 *     params: { page: 1, size: 10 }
 *   })
 *   if (loading) return <div>加载中...</div>
 *   if (error) return <div>错误：{error.message}</div>
 *   return <div>{JSON.stringify(res)}</div>
 * }
 */
