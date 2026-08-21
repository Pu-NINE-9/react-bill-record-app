import { DatePicker, NavBar, ActionSheet } from 'antd-mobile'
import { useSystemStore } from '@/stores'
import { useEffect, useMemo, useState } from 'react'
import { useRequest, useI18n } from '@/hooks'
import type { Locale } from '@/types/index'
import DayItem from '@/components/DayItem'
import type { MonthlyDayDetail, DayListItem, DayCostDetail } from '@/types/index'
import { UpOutline, DownOutline, GlobalOutline } from 'antd-mobile-icons'

export default function Month() {
  const { t, lang, changeLocale } = useI18n()
  const [langSheetVisible, setLangSheetVisible] = useState(false)

  // 语言选项，key和你的Locale类型严格对应
  const langOptions: Array<{ label: string; value: Locale }> = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
    { label: '한국어', value: 'ko-KR' }
  ]

  // 选中语言回调
  const handleSelectLang = (val: Locale) => {
    changeLocale(val)
    setLangSheetVisible(false)
  }
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
        <NavBar
          className="nav text-[#fbafde]"
          back={
            <div
              className="flex items-center gap-1 cursor-pointer active:text-[#fbafde]"
              onClick={() => setLangSheetVisible(true)}
            >
              <GlobalOutline fontSize={20} className="text-inherit" />
              <span className="text-sm">{lang}</span>
            </div>
          }
          backIcon={false}
        >
          {t('month.monthlyPay')}
        </NavBar>

        <section className="screen">
          <div className="bill-card bg-amber-200 rounded-2xl mb-4 mx-3 py-8 px-6">
            <div
              className="text-lg mb-10 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setVisible(true)}
            >
              {date.year} | {date.month} {t('month.monthBill')}
              {visible ? <UpOutline /> : <DownOutline />}
            </div>

            <div className="flex justify-between">
              <div className="text-center">
                <div className="text-sm font-semibold">{-(res?.totalPay ?? 0)}</div>
                <div className="mt-2 text-sm">{t('month.pay')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalIncome ?? 0}</div>
                <div className="mt-2 text-sm">{t('month.income')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">{res?.totalBalance ?? 0}</div>
                <div className="mt-2 text-sm">{t('month.balance')}</div>
              </div>
            </div>
          </div>

          <div>
            <DatePicker
              className="date"
              title={t('month.billRecordTime')}
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
            <div className="text-center py-6 text-gray-500">{t('system.loading')}</div>
          ) : dayList.length === 0 ? (
            <div className="text-center py-6 text-gray-500">{t('system.noBillData')}</div>
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

      {/* 语言弹窗 */}
      <ActionSheet
        visible={langSheetVisible}
        onClose={() => setLangSheetVisible(false)}
        actions={langOptions.map((opt) => ({
          text: opt.label,
          key: opt.value,
          // 当前选中的语言高亮
          danger: lang === opt.value,
          onClick: () => handleSelectLang(opt.value)
        }))}
        cancelText={t('system.cancel')}
      />
    </>
  )
}
