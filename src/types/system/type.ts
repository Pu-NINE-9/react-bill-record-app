import type { ComponentType } from 'react'

// 底部导航栏具体项
export interface TabBarItem {
  key: string
  title: string
  icon: ComponentType
}

export interface DayListItem {
  balance: number
  date: string
  income: number
  pay: number
}

export interface MonthlyDayDetail {
  dayList: DayListItem[]
  month: number
  totalBalance: number
  totalPay: number
  totalIncome: number
  year: number
}

// 仓库
export interface TabBarStore {
  tabBarList: TabBarItem[]
  refreshFlag: number // 用数字，每次+1，用来触发副作用
  triggerRefresh: () => void
  date: {
    year: number
    month: number
  }
  setDate: (payload: Partial<{ year: number; month: number }>) => void
  visible: boolean
  setVisible: (status: boolean) => void
}
