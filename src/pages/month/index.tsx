import { DatePicker, NavBar } from 'antd-mobile'
import { UpOutline, DownOutline } from 'antd-mobile-icons'
import { useSystemStore } from '@/stores'
import { useEffect, useMemo } from 'react'
import { useRequest } from '@/hooks'
import type { MonthlyDayDetail, DayListItem } from '@/types/index'

export default function Month() {
  // 获取仓库数据
  const visible = useSystemStore((s) => s.visible)
  const setVisible = useSystemStore((s) => s.setVisible)
  const setDate = useSystemStore((s) => s.setDate)
  const date = useSystemStore((s) => s.date)

  // TODO: 发送请求渲染当前月的详细数据
  // 先缓存数据，避免反复请求
  const params = useMemo(() => {
    return {
      year: date.year,
      month: date.month
    }
  }, [date.year, date.month])

  // 请求数据
  const { res, run, loading } = useRequest<MonthlyDayDetail>(
    '/bill/statistics',
    'GET',
    params,
    undefined,
    undefined,
    false
  )

  // 详细数据
  const dayList: DayListItem[] = res && Array.isArray(res.dayList) ? res.dayList : []

  // 只触发请求
  useEffect(() => {
    if (params.year && params.month) run()
  }, [params, run])

  return (
    <>
      <div className="month">
        {/* 头部区域 */}
        <NavBar className="nav" backIcon={false}>
          月度支付
        </NavBar>

        {/* 账单卡片 */}
        <section className="screen">
          <div className="bill-card bg-amber-200 rounded-2xl mb-4 mx-3 py-8 px-6">
            {/* 日期选择器的相关逻辑 */}
            <div
              className="text-lg mb-10 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setVisible(true)}
            >
              {date.year} | {date.month}月账单
              {visible ? <UpOutline /> : <DownOutline />}
            </div>

            {/* 三栏：支出｜收入｜结余 */}
            <div className="flex justify-between">
              {/* 支出 */}
              <div className="text-center">
                <div className="text-sm font-semibold">{-res?.totalPay ?? 0}</div>
                <div className="mt-2 text-sm">支出</div>
              </div>

              {/* 收入 */}
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalIncome ?? 0}</div>
                <div className="mt-2 text-sm">收入</div>
              </div>

              {/* 结余 */}
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalBalance ?? 0}</div>
                <div className="mt-2 text-sm">结余</div>
              </div>
            </div>
          </div>

          <div>
            {/* 日期切换 */}
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

            {/* 金额相关 */}
            <div></div>
          </div>
        </section>

        {/* 每日账单列表 */}
        <section className="mx-3 mt-4 space-y-3">
          {loading ? (
            <div className="text-center py-6 text-gray-500">加载中...</div>
          ) : dayList.length === 0 ? (
            <div className="text-center py-6 text-gray-500">本月暂无账单数据</div>
          ) : (
            dayList.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xl font-medium">{item.date}</div>
                  <UpOutline fontSize={20} />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-red-500">支出：</span>
                    <span className="ml-1 text-lsm">{-item.pay.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-green-600">收入：</span>
                    <span className="ml-1 text-lsm">{item.income.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="ml-1 text-gray-500">结余：</span>
                    <span className="text-lsm font-medium">{item.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  )
}
