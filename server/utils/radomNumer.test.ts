import { afterEach, describe, expect, it, vi } from 'vitest'
import getRandomNumberString from './radomNumer'

describe('getRandomNumberString', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('position=start 时返回带前导零的字符串', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    // Math.floor(0 * limit) + 1 = 1 → '1' → padStart(2, '0') → '01'
    expect(getRandomNumberString(31, 'start', 2)).toBe('01')
  })

  it('position=end 时返回后置补零的字符串', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    // 1 → '1' → padEnd(2, '0') → '10'
    expect(getRandomNumberString(31, 'end', 2)).toBe('10')
  })

  it('返回值是字符串且长度不小于 digit', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const result = getRandomNumberString(31, 'start', 2)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('digit 非法（0/负数/小数）时抛出 RangeError', () => {
    expect(() => getRandomNumberString(31, 'start', 0)).toThrow(RangeError)
    expect(() => getRandomNumberString(31, 'start', -1)).toThrow(RangeError)
    expect(() => getRandomNumberString(31, 'start', 1.5)).toThrow(RangeError)
  })

  it('position 非法时抛出 TypeError', () => {
    expect(() => getRandomNumberString(31, 'middle' as never, 2)).toThrow(TypeError)
  })
})
