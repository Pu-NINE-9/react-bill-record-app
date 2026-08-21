import { defineHandler } from 'nitro'

export default defineHandler(() => {
  return {
    code: 200,
    data: [
      {
        id: 1,
        type: 'pay',
        money: -123.0,
        date: '2026-08-18 14:30:00',
        useFor: 'drinks'
      }
    ]
  }
})
