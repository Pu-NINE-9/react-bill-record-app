import { DatePicker, NavBar } from 'antd-mobile'
import { useSystemStore } from '@/stores'
import { useEffect, useMemo, useState } from 'react'
import { useRequest } from '@/hooks'
import DayItem from '@/components/DayItem'
import type { MonthlyDayDetail, DayListItem, DayCostDetail } from '@/types/index'
import { UpOutline, DownOutline } from 'antd-mobile-icons'

export default function Month() {
  const visible = useSystemStore((s) => s.visible)
  const setVisible = useSystemStore((s) => s.setVisible)
  const setDate = useSystemStore((s) => s.setDate)
  const date = useSystemStore((s) => s.date)

  // 每个日期独立展开状态 key:日期字符串
  const [expandMap, setExpandMap] = useState<Record<string, boolean>>({})
  // 缓存请求过的明细数据，key=日期
  const [detailCache, setDetailCache] = useState<Record<string, DayCostDetail[]>>({})

  const params = useMemo(() => {
    return {
      year: date.year,
      month: date.month
    }
  }, [date.year, date.month])

  const { res, run, loading } = useRequest<MonthlyDayDetail>(
    '/bill/statistics',
    'GET',
    params,
    undefined,
    undefined,
    false
  )

  const dayList: DayListItem[] = res && Array.isArray(res.dayList) ? res.dayList : []

  useEffect(() => {
    if (params.year && params.month) run()
  }, [params, run])

  // 切换展开收起
  const handleToggle = (targetDate: string) => {
    setExpandMap((prev) => ({
      ...prev,
      [targetDate]: !prev[targetDate]
    }))
  }

  // 保存明细到缓存
  const handleSaveCache = (targetDate: string, list: DayCostDetail[]) => {
    setDetailCache((prev) => ({
      ...prev,
      [targetDate]: list
    }))
  }

  return (
    <>
      <div className="month">
        <NavBar className="nav" backIcon={false}>
          月度支付
        </NavBar>

        <section className="screen">
          <div className="bill-card bg-amber-200 rounded-2xl mb-4 mx-3 py-8 px-6">
            <div
              className="text-lg mb-10 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setVisible(true)}
            >
              {date.year} | {date.month}月账单
              {visible ? <UpOutline /> : <DownOutline />}
            </div>

            <div className="flex justify-between">
              <div className="text-center">
                <div className="text-sm font-semibold">{-res?.totalPay ?? 0}</div>
                <div className="mt-2 text-sm">支出</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalIncome ?? 0}</div>
                <div className="mt-2 text-sm">收入</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalBalance ?? 0}</div>
                <div className="mt-2 text-sm">结余</div>
              </div>
            </div>
          </div>

          <div>
            <DatePicker
              className="date"
              title="记账时间"
              precision="month"
              visible={visible}
              onClose={() => setVisible(false)}
              onConfirm={(val) => {
                setDate({
                  year: val.getFullYear(),
                  month: val.getMonth() + 1
                })
              }}
              max={new Date()}
            />
          </div>
        </section>

        <section className="mx-3 mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-6 text-gray-500">加载中...</div>
          ) : dayList.length === 0 ? (
            <div className="text-center py-6 text-gray-500">本月暂无账单数据</div>
          ) : (
            dayList.map((item, idx) => (
              <DayItem
                key={idx}
                item={item}
                open={expandMap[item.date] ?? false}
                detailList={detailCache[item.date]}
                onToggle={handleToggle}
                onSaveCache={handleSaveCache}
              />
            ))
          )}
        </section>
      </div>
    </>
  )
}
