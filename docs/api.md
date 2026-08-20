# 接口文档‑账单模块

> Mock服务基地址：`/api`
> 公共返回约定：所有接口统一 `{code:number, data?, dayBillList?, message?}`；**code=200 代表业务成功，其他code代表业务异常**

## 1. 获取全部账单列表

**GET /api/bill/list**

### 请求参数 Query

无

### 返回示例

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "type": "pay",
      "money": -123.0,
      "date": "2026-08-18 14:30:00",
      "useFor": "drinks"
    }
  ]
}
```

| 字段          | 类型       | 说明                                                     |
| ------------- | ---------- | -------------------------------------------------------- |
| code          | number     | 业务码，200成功                                          |
| data          | BillItem[] | 账单数组，条数38‑42条                                    |
| data[].id     | number     | 自增id                                                   |
| data[].type   | string     | `pay`支出 / `income`收入                                 |
| data[].money  | number     | 金额，支出为负数，收入正数                               |
| data[].date   | string     | 完整时间 `yyyy‑MM‑dd HH:mm:ss`                           |
| data[].useFor | enum       | `drinks`/`bonus`/`travel`/`salary`/`food`/`longdistance` |

---

## 2. 获取月度账单统计

**GET /api/bill/statistics**

### 请求Query参数

| 参数  | 类型   | 必填 | 说明              |
| ----- | ------ | ---- | ----------------- |
| year  | string | ✅   | 年份，例 `"2026"` |
| month | string | ✅   | 月份，例 `"8"`    |

> 示例请求：`/api/bill/statistics?year=2026&month=8`

### 返回示例

```json
{
  "code": 200,
  "data": {
    "year": 2026,
    "month": 8,
    "totalPay": 4230,
    "totalIncome": 6100,
    "totalBalance": 1870,
    "dayList": [
      {
        "date": "2026‑08‑01",
        "pay": 120,
        "income": 200,
        "balance": 80
      }
    ]
  }
}
```

| 字段              | 类型     | 说明                  |
| ----------------- | -------- | --------------------- |
| code              | number   | 业务码200成功         |
| data.year         | number   | 请求的年              |
| data.month        | number   | 请求的月              |
| data.totalPay     | number   | 当月总支出（正数）    |
| data.totalIncome  | number   | 当月总收入（正数）    |
| data.totalBalance | number   | 当月结余 = income‑pay |
| data.dayList[]    | object[] | 当月每一天统计        |
| dayList.date      | string   | 日期 `yyyy‑MM‑dd`     |
| dayList.pay       | number   | 当日总支出            |
| dayList.income    | number   | 当日总收入            |
| dayList.balance   | number   | 当日结余              |

---

## 3. 获取单日消费明细【新接口】

**GET /api/bill/day**

### 请求Query参数

| 参数 | 类型   | 必填 | 说明                                     |
| ---- | ------ | ---- | ---------------------------------------- |
| date | string | ✅   | 日期格式 `yyyy‑MM‑dd`，例 `"2026‑08‑18"` |

> 请求示例：`/api/bill/day?date=2026‑08‑18`

### 返回示例

```json
{
  "code": 200,
  "dayBillList": [
    {
      "useFor": "drinks",
      "money": -10.0
    },
    {
      "useFor": "salary",
      "money": 5200.0
    }
  ],
  "message": "查询成功"
}
```

| 字段                 | 类型            | 说明                                                           |
| -------------------- | --------------- | -------------------------------------------------------------- |
| code                 | number          | 业务码，200成功；0=缺少参数                                    |
| dayBillList          | DayCostDetail[] | 当日消费数组，0‑5条随机；空数组代表当日无账单                  |
| dayBillList[].useFor | 枚举            | `drinks`/`bonus`/`travel`/`salary`/`food`/`longdistance`       |
| dayBillList[].money  | number          | **salary、bonus为正数；其余全部负数，保留2位小数**             |
| message              | string          | 提示文案：`查询成功` / `当日暂无消费记录` / `缺少date查询参数` |

> 异常返回示例（不传date）

```json
{
  "code": 0,
  "dayBillList": [],
  "message": "缺少date查询参数"
}
```

---

# React组件调用示例（useRequest）

```tsx
import { useRequest } from 'ahooks'
import type { GetDayBillRes } from '@/types/index'

// 获取单日账单
const { data, loading, run } = useRequest<GetDayBillRes>(
  async (day: string) => {
    const res = await fetch(`/api/bill/day?date=${day}`)
    return res.json()
  },
  { manual: true }
)

// 使用，查询2026‑08‑18
run('2026-08-18')

// 安全取值
const dayBillList = data?.code === 200 ? data.dayBillList : []
```

### 如果你用你项目封装好的 useRequest

```tsx
const { res, run, loading } = useRequest<GetDayBillRes>('/api/bill/day', 'GET', {
  date: '2026-08-18'
})

const dayBillList = res?.code === 200 ? res.dayBillList : []
```

### JSX渲染UI（对应截图样式）

```tsx
{
  loading ? (
    <div>加载中...</div>
  ) : dayBillList.length === 0 ? (
    <div>当日暂无开销记录</div>
  ) : (
    dayBillList.map((item, idx) => (
      <div key={idx} className="flex justify-between py‑1">
        <span>{item.useFor}</span>
        <span className={item.money < 0 ? 'text‑red‑500' : 'text‑green‑500'}>
          {item.money.toFixed(2)}
        </span>
      </div>
    ))
  )
}
```

# TS类型汇总（types/index.ts）

```ts
export interface BillItem {
  id: number
  type: 'pay' | 'income'
  money: number
  date: string
  useFor: 'drinks' | 'bonus' | 'travel' | 'salary' | 'food' | 'longdistance'
}

export interface DayCostDetail {
  money: number
  useFor: 'drinks' | 'bonus' | 'travel' | 'salary' | 'food' | 'longdistance'
}

// 获取单日账单入参
export type GetDayBillParams = {
  date: string
}

// 获取单日账单返回
export interface GetDayBillRes {
  code: number
  dayBillList: DayCostDetail[]
  message?: string
}
```

> 小提示：
>
> 1. 接口为GET，参数放在query；
> 2. `salary`、`bonus` money为正数；其余类型money全部负数；
> 3. dayBillList为空数组，代表当日没有账单，前端不要报错，渲染空状态。
