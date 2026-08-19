// 单个账单的数据格式
export interface BillItem {
  type: 'pay' | 'income'
  money: number
  date: string
  useFor: 'drinks' | 'bonus' | 'travel' | 'salary' | 'food' | 'longdistance'
}

// 仓库数据格式
export interface BillStore {
  billList: BillItem[]
  setBillList: (list: BillItem[]) => void
  addBill: (bill: BillItem) => void
}

export interface MonthStatistics {
  year: number
  month: number
  payTotal: number // 总支出（正数）
  incomeTotal: number // 总收入（正数）
  balance: number // 结余 = incomeTotal − payTotal
}
