import { beforeEach, describe, expect, it } from 'vitest'
import { useBillStore } from './index'
import type { BillItem } from '@/types/index'

const initialBillState = useBillStore.getState()

const makeBill = (overrides: Partial<BillItem> = {}): BillItem => ({
  type: 'pay',
  money: 10,
  date: '2026-01-01',
  useFor: 'food',
  ...overrides
})

describe('useBillStore', () => {
  beforeEach(() => {
    useBillStore.setState(initialBillState, true)
  })

  it('初始状态 billList 为空数组', () => {
    expect(useBillStore.getState().billList).toEqual([])
  })

  it('setBillList 可以整体替换列表', () => {
    const list = [makeBill(), makeBill({ type: 'income', useFor: 'salary' })]
    useBillStore.getState().setBillList(list)
    expect(useBillStore.getState().billList).toEqual(list)
  })

  it('addBill 会追加账单', () => {
    const first = makeBill()
    useBillStore.getState().addBill(first)
    expect(useBillStore.getState().billList).toHaveLength(1)

    const second = makeBill({ money: 999 })
    useBillStore.getState().addBill(second)
    const list = useBillStore.getState().billList
    expect(list).toHaveLength(2)
    expect(list[0]).toEqual(first)
    expect(list[1]).toEqual(second)
  })

  it('addBill 追加多个账单时保持插入顺序', () => {
    const a = makeBill({ money: 1 })
    const b = makeBill({ money: 2 })
    const c = makeBill({ money: 3 })
    useBillStore.getState().addBill(a)
    useBillStore.getState().addBill(b)
    useBillStore.getState().addBill(c)
    expect(useBillStore.getState().billList.map((x) => x.money)).toEqual([1, 2, 3])
  })
})
