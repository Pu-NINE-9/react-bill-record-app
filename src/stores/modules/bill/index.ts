// 账单列表相关
import { create } from 'zustand'
import type { BillItem, BillStore } from '@/types/index'

export const useBillStore = create<BillStore>((set) => ({
  billList: [] as BillItem[],
  setBillList: (list: BillItem[]) => set({ billList: list }),
  addBill: (bill: BillItem) =>
    // set是zustand传给你的一个内置更新函数，专门用来修改仓库状态
    set((prev) => ({
      billList: [...prev.billList, bill]
    }))
}))
