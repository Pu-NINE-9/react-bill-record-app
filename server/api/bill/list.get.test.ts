import { describe, expect, it } from 'vitest'
import { mockEvent } from 'h3'
import handler from './list.get'

describe('GET /api/bill/list', () => {
  it('返回 code=200 且 data 为非空数组', () => {
    const res = handler(mockEvent('/api/bill/list')) as {
      code: number
      data: Array<Record<string, unknown>>
    }
    expect(res.code).toBe(200)
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBeGreaterThan(0)
  })

  it('账单项字段完整且类型正确', () => {
    const res = handler(mockEvent('/api/bill/list')) as {
      data: Array<{
        id: number
        type: string
        money: number
        date: string
        useFor: string
      }>
    }
    const first = res.data[0]
    expect(first.id).toEqual(expect.any(Number))
    expect(first.type).toEqual(expect.any(String))
    expect(first.money).toEqual(expect.any(Number))
    expect(first.date).toEqual(expect.any(String))
    expect(first.useFor).toEqual(expect.any(String))
  })

  it('支出账单 money 为负数', () => {
    const res = handler(mockEvent('/api/bill/list')) as {
      data: Array<{ type: string; money: number }>
    }
    const payItem = res.data.find((i) => i.type === 'pay')
    expect(payItem).toBeDefined()
    expect(payItem!.money).toBeLessThan(0)
  })
})
