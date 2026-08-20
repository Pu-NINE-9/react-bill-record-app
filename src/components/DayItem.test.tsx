import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import DayItem from './DayItem'
import { useRequest, useI18n } from '@/hooks'
import type { DayCostDetail, DayListItem } from '@/types/index'

vi.mock('@/hooks', () => ({
  useRequest: vi.fn(),
  useI18n: vi.fn()
}))

const mockedUseRequest = useRequest as unknown as Mock
const mockedUseI18n = useI18n as unknown as Mock

const defaultItem: DayListItem = {
  date: '2026-01-15',
  pay: 100.5,
  income: 50,
  balance: -50.5
}

const defaultDetail: DayCostDetail[] = [
  { useFor: 'food', money: -30 },
  { useFor: 'salary', money: 5000 }
]

function mockRequest(overrides: { run?: Mock; loading?: boolean } = {}) {
  const run: Mock = overrides.run ?? vi.fn().mockResolvedValue(null)
  mockedUseRequest.mockReturnValue({
    run,
    loading: overrides.loading ?? false,
    error: null,
    res: null
  })
  return { run }
}

function renderDayItem(props: Partial<Parameters<typeof DayItem>[0]> = {}) {
  const defaultProps = {
    item: defaultItem,
    open: false,
    detailList: undefined as DayCostDetail[] | undefined,
    onToggle: vi.fn(),
    onSaveCache: vi.fn()
  }
  return render(<DayItem {...defaultProps} {...props} />)
}

describe('DayItem 组件', () => {
  beforeEach(() => {
    mockedUseRequest.mockReset()
    mockedUseI18n.mockReset()
    mockedUseI18n.mockReturnValue({
      t: (key: string) => key,
      lang: '中文',
      changeLocale: vi.fn()
    })
  })

  it('渲染日期、支出、收入、结余（保留两位小数）及 i18n 标签', () => {
    mockRequest()
    renderDayItem()

    expect(screen.getByText('2026-01-15')).toBeInTheDocument()
    expect(screen.getByText('-100.50')).toBeInTheDocument()
    expect(screen.getByText('50.00')).toBeInTheDocument()
    expect(screen.getByText('-50.50')).toBeInTheDocument()

    // 标签走 i18n，mock t 为透传时渲染 key
    expect(screen.getByText('day.pay')).toBeInTheDocument()
    expect(screen.getByText('day.income')).toBeInTheDocument()
    expect(screen.getByText('day.balance')).toBeInTheDocument()
  })

  it('点击图标调用 onToggle 并传入日期', () => {
    const onToggle = vi.fn()
    mockRequest()
    const { container } = renderDayItem({ onToggle })

    fireEvent.click(container.querySelector('.icon')!)
    expect(onToggle).toHaveBeenCalledWith('2026-01-15')
  })

  it('展开时渲染明细，工资/奖金绿色，其他红色', () => {
    mockRequest()
    renderDayItem({ open: true, detailList: defaultDetail })

    expect(screen.getByText('food')).toBeInTheDocument()
    expect(screen.getByText('salary')).toBeInTheDocument()
    expect(screen.getByText('-30').className).toContain('text-red-500')
    expect(screen.getByText('5000').className).toContain('text-green-500')
  })

  it('展开且加载中显示加载文案（day.loading）', () => {
    mockRequest({ loading: true })
    renderDayItem({ open: true })

    expect(screen.getByText('day.loading')).toBeInTheDocument()
  })

  it('展开且 detailList 为空数组显示空态（day.noBillData）', () => {
    mockRequest()
    renderDayItem({ open: true, detailList: [] })

    expect(screen.getByText('day.noBillData')).toBeInTheDocument()
  })

  it('展开但 detailList 未就绪显示提示（day.notReady）', () => {
    mockRequest()
    renderDayItem({ open: true })

    expect(screen.getByText('day.notReady')).toBeInTheDocument()
  })

  it('展开请求成功后调用 onSaveCache 缓存明细', async () => {
    const dayBillList: DayCostDetail[] = [{ useFor: 'drinks', money: -15 }]
    const run = vi.fn().mockResolvedValue({ dayBillList })
    const onSaveCache = vi.fn()
    mockRequest({ run })

    const { container } = renderDayItem({ onSaveCache })
    fireEvent.click(container.querySelector('.icon')!)

    await waitFor(() => expect(onSaveCache).toHaveBeenCalledWith('2026-01-15', dayBillList))
  })

  it('请求失败时再次调用 onToggle 收起', async () => {
    const run = vi.fn().mockRejectedValue(new Error('boom'))
    const onToggle = vi.fn()
    mockRequest({ run })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = renderDayItem({ onToggle })
    fireEvent.click(container.querySelector('.icon')!)

    await waitFor(() => expect(onToggle).toHaveBeenCalledTimes(2))
    expect(onToggle).toHaveBeenNthCalledWith(1, '2026-01-15')
    expect(onToggle).toHaveBeenNthCalledWith(2, '2026-01-15')
    errorSpy.mockRestore()
  })
})
