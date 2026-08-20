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

// 每日金额变化情况
export interface DayListItem {
  balance: number
  date: string
  income: number
  pay: number
}

// 每月金额变化
export interface MonthlyDayDetail {
  dayList: DayListItem[]
  month: number
  totalBalance: number
  totalPay: number
  totalIncome: number
  year: number
}

// 每日金额详细开销
export interface DayCostDetail {
  money: number // salary和bonus为正，其他都为负
  useFor: 'drinks' | 'bonus' | 'travel' | 'salary' | 'food' | 'longdistance'
}

// 每日金额详细开销获取接口的params格式
export type GetDayBillParams = {
  date: string // 格式 YYYY‑MM‑DD，例："2026‑01‑01"
}

export interface GetDayBillRes {
  data: {
    dayBillList: DayCostDetail[]
  }
  code: 200 | 0
  message?: string
}

// 月份统计详细
export interface MonthStatistics {
  year: number
  month: number
  payTotal: number // 总支出（正数）
  incomeTotal: number // 总收入（正数）
  balance: number // 结余 = incomeTotal − payTotal
}
