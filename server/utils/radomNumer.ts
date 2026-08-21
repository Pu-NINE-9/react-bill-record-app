// TODO: 生成指定范围随机数的字符串

/**
 *
 * @param {Number} limit 上限
 * @param {Stirng} position 补充前导还是后置
 * @param {Number} digit 补充几位数
 * @returns {String} 01~limit范围内随机整数的字符串（个位会补前导零）
 */
const getRandomNumberString = (limit: number, position: 'start' | 'end', digit: number): string => {
  if (!(digit > 0 && Number.isInteger(digit)))
    throw new RangeError(`digit 必须大于等于1，收到：${digit}`)
  const str = String(Math.floor(Math.random() * limit) + 1)

  if (position === 'start') return str.padStart(digit, '0')
  else if (position === 'end') return str.padEnd(digit, '0')
  else throw new TypeError(`position 参数必须是 'start' 或者 'end'，收到：${String(position)}`)
}

export default getRandomNumberString
