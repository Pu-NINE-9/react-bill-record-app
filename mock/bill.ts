import type { MockMethod } from 'vite-plugin-mock'
import type { GetDayBillParams, GetDayBillRes, BillItem, DayCostDetail } from '@/types/index'
import Mock from 'mockjs'

const useForList = ['drinks', 'bonus', 'travel', 'salary', 'food', 'longdistance']

export default [
  // /api/bill/list: 获取总的数据
  {
    url: '/api/bill/list',
    method: 'get',
    timeout: 300,
    response: () => {
      const template = {
        'list|38-42': [
          {
            'id|+1': 1,
            'type|1': ['pay', 'income'],
            money: '@integer(10,2000)',
            date: '@datetime("yyyy-MM-dd HH:mm:ss")',
            useFor: () => Mock.Random.pick(useForList)
          }
        ]
      }

      const raw = Mock.mock(template) as { list: BillItem[] }

      // 生成完成后再处理正负金额，完全不需要临时字段 _type
      const list = raw.list.map((item) => {
        return {
          ...item,
          money: item.type === 'pay' ? -Math.abs(item.money) : Math.abs(item.money)
        }
      })

      return {
        code: 200,
        data: list
      }
    }
  },
  // /api/bill/statistics: 获取单月详细数据
  {
    url: '/api/bill/statistics',
    method: 'get',
    timeout: 300,
    response: ({ query }: { query: { year?: string; month?: string } }) => {
      const year = Number(query.year)
      const month = Number(query.month)

      // 获取当月总天数
      const dayCount = new Date(year, month, 0).getDate()

      let totalPay = 0
      let totalIncome = 0
      const dayList: Array<{
        date: string
        pay: number
        income: number
        balance: number
      }> = []

      for (let d = 1; d <= dayCount; d++) {
        const pay = Mock.Random.integer(0, 400)
        const income = Mock.Random.integer(0, 500)
        const balance = income - pay

        totalPay += pay
        totalIncome += income

        dayList.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
          pay,
          income,
          balance
        })
      }

      const totalBalance = totalIncome - totalPay

      return {
        code: 200,
        data: {
          year,
          month,
          totalPay,
          totalIncome,
          totalBalance,
          dayList
        }
      }
    }
  },
  // /api/bill/day: 每日详细开销
  {
    url: '/api/bill/day',
    method: 'get',
    timeout: 300,
    response: ({ query }: { query: GetDayBillParams }): GetDayBillRes => {
      const { date } = query

      if (!date) {
        return {
          code: 0,
          data: {
            dayBillList: []
          },
          message: '缺少date查询参数'
        }
      }

      const template = {
        'dayBillList|0-5': [
          {
            useFor: () => Mock.Random.pick(useForList),
            // ✅ @data.useFor 拿到同层级useFor的值，不再用this，避开TS的this解析bug
            money: '@data.useFor'
          }
        ]
      }

      const raw = Mock.mock(template) as { dayBillList: Array<{ useFor: string; money: string }> }

      const dayBillList: DayCostDetail[] = raw.dayBillList.map((item) => {
        const useFor = item.useFor as DayCostDetail['useFor']
        let money: number
        if (useFor === 'salary' || useFor === 'bonus') {
          money = Mock.Random.float(1000, 9000, 2, 2)
        } else {
          money = Mock.Random.float(-300, -5, 2, 2)
        }
        return { useFor, money }
      })

      return {
        code: 200,
        data: {
          dayBillList
        },
        message: dayBillList.length > 0 ? '查询成功' : '当日暂无消费记录'
      }
    }
  }
] as MockMethod[]
