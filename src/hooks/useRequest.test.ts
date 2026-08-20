import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import useRequest from './useRequest'
import instance from '@/utils/request'

vi.mock('@/utils/request', () => ({
  default: { request: vi.fn() }
}))

const mockedRequest = instance.request as unknown as Mock

describe('useRequest', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('autoRun 默认为true，挂载后自动发起请求并返回数据', async () => {
    mockedRequest.mockResolvedValue({ id: 1, name: 'bill' })

    const { result } = renderHook(() => useRequest<{ id: number; name: string }>('/api/bill/list'))

    await waitFor(() => expect(result.current.res).toEqual({ id: 1, name: 'bill' }))
    expect(mockedRequest).toHaveBeenCalledTimes(1)
    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/bill/list', method: 'GET' })
    )
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('请求进行中 loading 为 true', async () => {
    let resolveFn!: (value: unknown) => void
    mockedRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        })
    )

    const { result } = renderHook(() => useRequest('/api/bill/list'))

    await waitFor(() => expect(result.current.loading).toBe(true))
    expect(result.current.res).toBeNull()

    await act(async () => {
      resolveFn({ ok: true })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.res).toEqual({ ok: true })
  })

  it('请求失败时设置 error 且 loading 恢复为false', async () => {
    const err = new Error('网络错误')
    mockedRequest.mockRejectedValue(err)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useRequest('/api/bill/list'))

    await waitFor(() => expect(result.current.error).toEqual(err))
    expect(result.current.loading).toBe(false)
    expect(result.current.res).toBeNull()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('autoRun=false 时不自动请求，run 手动触发', async () => {
    mockedRequest.mockResolvedValue({ value: 42 })

    const { result } = renderHook(() =>
      useRequest<{ value: number }>('/api/x', 'GET', undefined, undefined, undefined, false)
    )

    expect(mockedRequest).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)

    let returned: { value: number } | null | undefined
    await act(async () => {
      returned = await result.current.run()
    })
    expect(mockedRequest).toHaveBeenCalledTimes(1)
    expect(returned).toEqual({ value: 42 })
    expect(result.current.res).toEqual({ value: 42 })
  })

  it('run 的 override 会与初始 params/data 合并', async () => {
    mockedRequest.mockResolvedValue(null)
    const { result } = renderHook(() =>
      useRequest('/api/bill', 'POST', { year: 2026 }, { source: 'web' }, undefined, false)
    )

    await act(async () => {
      await result.current.run({ params: { month: 1 }, data: { page: 2 } })
    })

    expect(mockedRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/bill',
        method: 'POST',
        params: { year: 2026, month: 1 },
        data: { source: 'web', page: 2 }
      })
    )
  })

  it('组件卸载后异步结果返回也不会更新状态（不抛错）', async () => {
    let resolveFn!: (value: unknown) => void
    mockedRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        })
    )

    const { result, unmount } = renderHook(() => useRequest('/api/bill/list'))
    await waitFor(() => expect(result.current.loading).toBe(true))

    unmount()

    await act(async () => {
      resolveFn({ late: true })
    })

    expect(mockedRequest).toHaveBeenCalledTimes(1)
  })
})
