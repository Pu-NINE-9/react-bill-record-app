import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import Month from './index'
import { useRequest } from '@/hooks'
import { useSystemStore } from '@/stores'
import type { MonthlyDayDetail } from '@/types/index'

vi.mock('@/hooks', () => ({
  useRequest: vi.fn()
}))

vi.mock('@/components/DayItem', async () => {
  const React = await import('react')
  return {
    default: ({ item }: { item: { date: string } }) =>
      React.createElement('div', { 'data-testid': 'day-item' }, item.date)
  }
})

vi.mock('antd-mobile', async () => {
  const React = await import('react')
  return {
    NavBar: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'navbar' }, children),
    DatePicker: () => null
  }
})

const mockedUseRequest = useRequest as unknown as Mock

const fullRes: MonthlyDayDetail = {
  year: 2026,
  month: 1,
  totalPay: 300,
  totalIncome: 500,
  totalBalance: 200,
  dayList: [
    { date: '2026-01-01', pay: 100, income: 200, balance: 100 },
    { date: '2026-01-02', pay: 200, income: 300, balance: 100 }
  ]
}

function mockRequest(overrides: { res?: MonthlyDayDetail | null; loading?: boolean } = {}) {
  const run = vi.fn()
  mockedUseRequest.mockReturnValue({
    res: overrides.res ?? null,
    run,
    loading: overrides.loading ?? false,
    error: null
  })
  return { run }
}

describe('Month 页面', () => {
  beforeEach(() => {
    mockedUseRequest.mockReset()
    useSystemStore.setState({ date: { year: 2026, month: 1 }, visible: false }, false)
  })

  it('渲染标题和所选年月', () => {
    mockRequest({ res: fullRes })
    render(<Month />)

    expect(screen.getByText('月度支付')).toBeInTheDocument()
    expect(screen.getByText('2026 | 1月账单')).toBeInTheDocument()
  })

  it('渲染总支出、收入、结余', () => {
    mockRequest({ res: fullRes })
    render(<Month />)

    expect(screen.getByText('-300')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('加载中显示 loading 文案', () => {
    mockRequest({ res: fullRes, loading: true })
    render(<Month />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('无数据时显示空状态', () => {
    mockRequest({ res: { ...fullRes, dayList: [] } })
    render(<Month />)

    expect(screen.getByText('本月暂无账单数据')).toBeInTheDocument()
  })

  it('有数据时渲染每日条目', () => {
    mockRequest({ res: fullRes })
    render(<Month />)

    expect(screen.getAllByTestId('day-item')).toHaveLength(2)
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
    expect(screen.getByText('2026-01-02')).toBeInTheDocument()
  })

  it('挂载后会自动请求统计数据', () => {
    const { run } = mockRequest({ res: fullRes })
    render(<Month />)

    expect(run).toHaveBeenCalled()
  })
})
