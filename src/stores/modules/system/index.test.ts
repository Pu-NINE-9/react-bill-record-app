import { beforeEach, describe, expect, it } from 'vitest'
import { useSystemStore } from './index'

const initialState = useSystemStore.getState()

describe('useSystemStore', () => {
  beforeEach(() => {
    useSystemStore.setState(initialState, true)
  })

  it('底部导航栏只包含1项（月度账单）', () => {
    const list = useSystemStore.getState().tabBarList
    expect(list.map((i) => i.key)).toEqual(['/month'])
    expect(list.map((i) => i.title)).toEqual(['月度账单'])
  })

  it('refreshFlag 初始为0，triggerRefresh 每次+1', () => {
    expect(useSystemStore.getState().refreshFlag).toBe(0)
    useSystemStore.getState().triggerRefresh()
    expect(useSystemStore.getState().refreshFlag).toBe(1)
    useSystemStore.getState().triggerRefresh()
    expect(useSystemStore.getState().refreshFlag).toBe(2)
  })

  it('date 初始为当前年月', () => {
    const now = new Date()
    const { date } = useSystemStore.getState()
    expect(date.year).toBe(now.getFullYear())
    expect(date.month).toBe(now.getMonth() + 1)
  })

  it('setDate 支持部分更新并与原值合并', () => {
    useSystemStore.getState().setDate({ year: 2026 })
    expect(useSystemStore.getState().date.year).toBe(2026)
    expect(useSystemStore.getState().date.month).toBe(initialState.date.month)

    useSystemStore.getState().setDate({ month: 3 })
    expect(useSystemStore.getState().date).toEqual({ year: 2026, month: 3 })
  })

  it('visible 初始为false，setVisible 可切换显示隐藏', () => {
    expect(useSystemStore.getState().visible).toBe(false)
    useSystemStore.getState().setVisible(true)
    expect(useSystemStore.getState().visible).toBe(true)
    useSystemStore.getState().setVisible(false)
    expect(useSystemStore.getState().visible).toBe(false)
  })
})
