import { create } from 'zustand'
import { BillOutline } from 'antd-mobile-icons'

import type { TabBarItem, TabBarStore } from '@/types/index'

export const useSystemStore = create<TabBarStore>((set) => ({
  // 底部导航栏信息
  tabBarList: [
    {
      key: '/month',
      title: '月度账单',
      icon: BillOutline
    }
  ] as TabBarItem[],
  // 刷新标识
  refreshFlag: 0,
  // 刷新方法
  triggerRefresh: () => {
    set((s) => ({
      ...s,
      refreshFlag: s.refreshFlag + 1
    }))
  },
  // 日期
  date: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  },
  setDate: (newDate) => {
    set((prev) => ({
      ...prev,
      date: { ...prev.date, ...newDate }
    }))
  },
  // 日期选择器显示隐藏
  visible: false,
  setVisible: (status) => {
    set((prev) => ({
      ...prev,
      visible: status
    }))
  }
}))
