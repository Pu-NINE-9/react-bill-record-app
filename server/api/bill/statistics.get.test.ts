import { describe, expect, it } from 'vitest'
import { mockEvent } from 'h3'
import handler from './statistics.get'
import type { DayListItem } from '../../../src/types/index'

interface StatisticsRes {
  code: number
  data: {
    year: number
    month: number
    totalPay: number
    totalIncome: number
    totalBalance: number
    dayList: DayListItem[]
  }
}

describe('GET /api/bill/statistics', () => {
  function call(query = 'year=2026&month=8'): StatisticsRes {
    const url = query ? `/api/bill/statistics?${query}` : '/api/bill/statistics'
    return handler(mockEvent(url)) as StatisticsRes
  }

  it('返回 code=200，year/month 与入参一致', () => {
    const res = call('year=2026&month=8')
    expect(res.code).toBe(200)
    expect(res.data.year).toBe(2026)
    expect(res.data.month).toBe(8)
  })

  it('dayList 条数在 4~12 之间', () => {
    const res = call()
    expect(res.data.dayList.length).toBeGreaterThanOrEqual(4)
    expect(res.data.dayList.length).toBeLessThanOrEqual(12)
  })

  it('每条 balance === income - pay', () => {
    const res = call()
    for (const item of res.data.dayList) {
      expect(item.balance).toBe(item.income - item.pay)
    }
  })

  it('dayList 按日期降序排列', () => {
    const res = call()
    const dates = res.data.dayList.map((d) => d.date)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('date 格式为 yyyy-MM-dd 且日期合法', () => {
    const res = call('year=2026&month=8')
    for (const item of res.data.dayList) {
      expect(item.date).toMatch(/^2026-08-\d{2}$/)
    }
  })

  it('汇总值等于 dayList 累加', () => {
    const res = call()
    const pay = res.data.dayList.reduce((s, i) => s + i.pay, 0)
    const income = res.data.dayList.reduce((s, i) => s + i.income, 0)
    expect(res.data.totalPay).toBe(pay)
    expect(res.data.totalIncome).toBe(income)
    expect(res.data.totalBalance).toBe(income - pay)
  })

  it('缺省 year/month 时使用默认值 2026/8', () => {
    const res = call('')
    expect(res.data.year).toBe(2026)
    expect(res.data.month).toBe(8)
  })
})
