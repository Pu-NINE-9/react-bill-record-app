import { UpOutline, DownOutline } from 'antd-mobile-icons'
import { useRequest, useI18n } from '@/hooks'
import type { DayListItem, DayCostDetail } from '@/types/index'

interface Props {
  item: DayListItem
  open: boolean
  detailList: DayCostDetail[] | undefined
  onToggle: (date: string) => void
  onSaveCache: (date: string, list: DayCostDetail[]) => void
}

export default function DayItem(props: Props) {
  const { t } = useI18n()
  const { item, open, detailList, onToggle, onSaveCache } = props

  const { run: dayRun, loading: dayLoading } = useRequest<{ dayBillList: DayCostDetail[] }>(
    '/bill/day',
    'GET',
    undefined,
    undefined,
    undefined,
    false
  )

  const handleClick = async () => {
    const willOpen = !open
    onToggle(item.date)

    if (willOpen) {
      try {
        const resData = await dayRun({ params: { date: item.date } })
        console.log('👉dayRun返回 resData：', resData)
        if (resData?.dayBillList) {
          onSaveCache(item.date, resData.dayBillList)
        }
      } catch (err) {
        console.error('获取当日账单失败', err)
        onToggle(item.date)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="text-xl font-medium">{item.date}</div>
        <div className="icon" onClick={handleClick}>
          {open ? <UpOutline fontSize={20} /> : <DownOutline fontSize={20} />}
        </div>
      </div>

      <div className="flex border-b-2 border-gray-100 justify-between items-end pb-2">
        <div>
          <span className="text-red-500">{t('day.pay')}</span>
          <span className="ml-1 text-sm">{(-(item.pay ?? 0)).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-green-600">{t('day.income')}</span>
          <span className="ml-1 text-sm">{(item.income ?? 0).toFixed(2)}</span>
        </div>
        <div>
          <span className="ml-1 text-gray-500">{t('day.balance')}</span>
          <span className="text-sm font-medium">{(item.balance ?? 0).toFixed(2)}</span>
        </div>
      </div>

      {open && (
        <div className="mt-3">
          {dayLoading && <div className="text-gray-400">{t('day.loading')}</div>}
          {detailList ? (
            <>
              {detailList.length === 0 ? (
                <div className="text-gray-400 mt-2">{t('day.noBillData')}</div>
              ) : (
                detailList.map((d) => (
                  <div key={d.useFor} className="flex justify-between mt-2">
                    <div>{d.useFor}</div>
                    <div
                      className={`text-sm ${d.useFor === 'bonus' || d.useFor === 'salary' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {d.money}
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="text-gray-400 mt-2">{t('day.notReady')}</div>
          )}
        </div>
      )}
    </div>
  )
}
