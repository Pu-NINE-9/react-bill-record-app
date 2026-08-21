import { describe, expect, it, vi } from 'vitest'
import { mockEvent } from 'h3'
import handler from './day.get'
import type { DayCostDetail } from '../../../src/types/index'

const INCOME_TYPES = ['salary', 'bonus']

interface DayRes {
  code: number
  data: { dayBillList: DayCostDetail[] }
  message: string
}

describe('GET /api/bill/day', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function call(date?: string): DayRes {
    const url = date ? `/api/bill/day?date=${date}` : '/api/bill/day'
    return handler(mockEvent(url)) as DayRes
  }

  it('返回 code=200 和 dayBillList 数组', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = call('2026-08-18')
    expect(res.code).toBe(200)
    expect(Array.isArray(res.data.dayBillList)).toBe(true)
    expect(res.message).toBe('查询成功')
  })

  it('dayBillList 条数在 2~6 之间', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = call('2026-08-18')
    expect(res.data.dayBillList.length).toBeGreaterThanOrEqual(2)
    expect(res.data.dayBillList.length).toBeLessThanOrEqual(6)
  })

  it('useFor 不重复', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = call('2026-08-18')
    const useFors = res.data.dayBillList.map((d) => d.useFor)
    expect(new Set(useFors).size).toBe(useFors.length)
  })

  it('salary/bonus 金额为正，其余为负', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = call('2026-08-18')
    for (const d of res.data.dayBillList) {
      if (INCOME_TYPES.includes(d.useFor)) {
        expect(d.money).toBeGreaterThan(0)
      } else {
        expect(d.money).toBeLessThan(0)
      }
    }
  })
})
