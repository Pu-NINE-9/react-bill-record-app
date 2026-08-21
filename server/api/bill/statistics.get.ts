import { defineHandler } from 'nitro'
import { getQuery } from 'h3'
import type { H3Event } from 'nitro'
import type { DayListItem } from '../../../src/types/index'
import getRandomNumberString from '../../utils/radomNumer'

/**
 * 判断是否闰年
 * @param {Number} year 年份
 * @returns {Boolean} 是否闰年
 */
const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

/**
 * 生成随机日期
 * @param {String} year 年
 * @param {String} month 月
 * @returns {String} 日期
 */
const getRandomDay = (year: string, month: string) => {
  if (month === '2')
    return isLeapYear(Number(year))
      ? getRandomNumberString(29, 'start', 2)
      : getRandomNumberString(28, 'start', 2)
  else if ([1, 3, 5, 7, 8, 10, 12].includes(Number(month)))
    return getRandomNumberString(31, 'start', 2)
  else return getRandomNumberString(30, 'start', 2)
}

/**
 * 生成随机账单数组
 * @param {String} year 年份字符串
 * @param {String} month 月份字符串
 * @param {Number} minLen 数组最小条数
 * @param {Number} maxLen 数组最大条数
 * @returns 账单对象数组
 */
const generateBillList = (year: string, month: string, minLen: number, maxLen: number) => {
  const list: DayListItem[] = []

  // 随机数组长度 [minLen, maxLen]
  const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen

  for (let i = 0; i < len; i++) {
    // 随机收支数值，可自行修改区间
    const pay = Math.floor(Math.random() * 791) + 10
    const income = Math.floor(Math.random() * 1151) + 50
    const balance = income - pay

    // 复用你自己写好的 getRandomDay 获取随机日字符串
    const dayStr = getRandomDay(year, month)
    const monthPad = month.padStart(2, '0')
    const date = `${year}-${monthPad}-${dayStr}`

    list.push({
      date,
      pay,
      income,
      balance
    })
  }
  return list
}

export default defineHandler((event: H3Event) => {
  const query = getQuery(event)
  const yearRaw = Array.isArray(query.year) ? query.year[0] : query.year
  const monthRaw = Array.isArray(query.month) ? query.month[0] : query.month

  const year = yearRaw ?? '2026'
  const month = monthRaw ?? '8'

  const dayList = generateBillList(year, month, 4, 12)

  // ✅ 按日期降序：大日期（靠后）排在数组前面
  dayList.sort((a, b) => {
    return b.date.localeCompare(a.date)
  })

  // 根据列表自动计算统计值
  const totalPay = dayList.reduce((s, item) => s + item.pay, 0)
  const totalIncome = dayList.reduce((s, item) => s + item.income, 0)
  const totalBalance = totalIncome - totalPay

  return {
    code: 200,
    data: {
      year: Number(year),
      month: Number(month),
      totalPay,
      totalIncome,
      totalBalance,
      dayList
    }
  }
})
