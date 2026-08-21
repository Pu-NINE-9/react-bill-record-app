import { defineHandler } from 'nitro'
import { getQuery } from 'h3'
import type { H3Event } from 'nitro'
import type { DayCostDetail } from '../../../src/types/index'

/**
 * 数组洗牌工具
 * @param arr 原数组
 * @returns 打乱后的新数组
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * 生成随机 DayCostDetail 数组，保证useFor不重复
 * @param minLen 最小条数
 * @param maxLen 最大条数；注意：不能超过6，一共只有6种useFor
 * @returns DayCostDetail[]
 */
function generateDayCostList(minLen: number, maxLen: number): DayCostDetail[] {
  const useForAll: DayCostDetail['useFor'][] = [
    'drinks',
    'bonus',
    'travel',
    'salary',
    'food',
    'longdistance'
  ]

  // 安全保护：最多不超过全部枚举数量6
  const safeMax = Math.min(maxLen, useForAll.length)
  const total = Math.floor(Math.random() * (safeMax - minLen + 1)) + minLen

  // 洗牌，再截取前total个，天然不会重复
  const shuffled = shuffle(useForAll)
  const pickList = shuffled.slice(0, total)

  const list: DayCostDetail[] = []
  for (const randomUseFor of pickList) {
    let money: number
    if (randomUseFor === 'salary' || randomUseFor === 'bonus') {
      // 收入：正数 1000 ~ 12000，保留1位小数
      money = Number((Math.random() * 11000 + 1000).toFixed(1))
    } else {
      // 支出：负数 -1 ~ -2000
      money = Number((-(Math.random() * 1999 + 1)).toFixed(1))
    }

    list.push({
      useFor: randomUseFor,
      money
    })
  }

  return list
}

export default defineHandler((event: H3Event) => {
  const { date } = getQuery(event)
  console.log(`====${date}====`)
  // 随机生成 2 ~ 6 条记录，最多6，因为只有6种用途
  const dayBillList = generateDayCostList(2, 6)

  return {
    code: 200,
    data: {
      dayBillList
    },
    message: '查询成功'
  }
})
