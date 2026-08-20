import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import Month from './index'
import { useRequest, useI18n } from '@/hooks'
import { useSystemStore } from '@/stores'
import type { MonthlyDayDetail } from '@/types/index'

vi.mock('@/hooks', () => ({
  useRequest: vi.fn(),
  useI18n: vi.fn()
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
    NavBar: ({ children, back }: { children?: React.ReactNode; back?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'navbar' }, back, children),
    DatePicker: () => null,
    ActionSheet: (props: {
      visible?: boolean
      actions?: Array<{ text: string; key?: string; onClick?: () => void }>
      cancelText?: string
    }) =>
      props.visible
        ? React.createElement(
            'div',
            { 'data-testid': 'lang-sheet' },
            (props.actions ?? []).map((a) =>
              React.createElement(
                'button',
                { key: a.key ?? a.text, type: 'button', onClick: a.onClick },
                a.text
              )
            ),
            props.cancelText ? React.createElement('div', null, props.cancelText) : null
          )
        : null
  }
})

const mockedUseRequest = useRequest as unknown as Mock
const mockedUseI18n = useI18n as unknown as Mock

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
    mockedUseI18n.mockReset()
    mockedUseI18n.mockReturnValue({
      t: (key: string) => key,
      lang: '中文',
      changeLocale: vi.fn()
    })
    useSystemStore.setState({ date: { year: 2026, month: 1 }, visible: false }, false)
  })

  it('渲染标题和所选年月', () => {
    mockRequest({ res: fullRes })
    render(<Month />)

    expect(screen.getByText('month.monthlyPay')).toBeInTheDocument()
    expect(screen.getByText('2026 | 1 month.monthBill')).toBeInTheDocument()
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

    expect(screen.getByText('system.loading')).toBeInTheDocument()
  })

  it('无数据时显示空状态', () => {
    mockRequest({ res: { ...fullRes, dayList: [] } })
    render(<Month />)

    expect(screen.getByText('system.noBillData')).toBeInTheDocument()
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

  it('点击语言按钮弹出选项，选择后调用 changeLocale', () => {
    const changeLocale = vi.fn()
    mockedUseI18n.mockReturnValue({
      t: (key: string) => key,
      lang: '中文',
      changeLocale
    })
    mockRequest({ res: fullRes })

    const { container } = render(<Month />)

    // 点击 NavBar 上的语言按钮（back 区域）
    fireEvent.click(container.querySelector('[data-testid="navbar"] .cursor-pointer')!)

    // 语言弹窗出现并选择 English
    expect(screen.getByTestId('lang-sheet')).toBeInTheDocument()
    fireEvent.click(screen.getByText('English'))

    expect(changeLocale).toHaveBeenCalledWith('en')
  })
})
