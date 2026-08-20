import { beforeEach, describe, expect, it, vi } from 'vitest'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// mock json资源
vi.mock('./config/zh-CN.json', () => ({ default: { common: { cancel: '取消' } } }))
vi.mock('./config/en.json', () => ({ default: { common: { cancel: 'Cancel' } } }))
vi.mock('./config/ko-KR.json', () => ({ default: { common: { cancel: '취소' } } }))

// 手动构造mock i18n实例，增加类型
const mockI18nInstance = {
  use: vi.fn().mockReturnThis(),
  init: vi.fn().mockResolvedValue(true)
}

vi.mock('i18next', () => ({
  default: mockI18nInstance
}))

vi.mock('react-i18next', () => ({
  initReactI18next: {}
}))
vi.mock('i18next-browser-languagedetector', () => ({
  default: {}
}))

describe('i18n config init', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('i18n 注册插件：LanguageDetector + initReactI18next', async () => {
    await import('./index')

    expect(mockI18nInstance.use).toHaveBeenCalledTimes(2)
    expect(mockI18nInstance.use).toHaveBeenCalledWith(LanguageDetector)
    expect(mockI18nInstance.use).toHaveBeenCalledWith(initReactI18next)
  })

  it('init 传入正确 resources 翻译资源', async () => {
    await import('./index')
    const initOptions = mockI18nInstance.init.mock.calls[0][0]

    expect(initOptions.resources).toHaveProperty('en')
    expect(initOptions.resources).toHaveProperty('zh-CN')
    expect(initOptions.resources).toHaveProperty('ko-KR')

    expect(initOptions.resources.en.translation).toEqual({ common: { cancel: 'Cancel' } })
    expect(initOptions.resources['zh-CN'].translation).toEqual({ common: { cancel: '取消' } })
    expect(initOptions.resources['ko-KR'].translation).toEqual({ common: { cancel: '취소' } })
  })

  it('fallbackLng 配置正确', async () => {
    await import('./index')
    const initOptions = mockI18nInstance.init.mock.calls[0][0]
    expect(initOptions.fallbackLng).toEqual(['en', 'zh-CN', 'ko-KR'])
  })

  it('interpolation.escapeValue 设置为 false', async () => {
    await import('./index')
    const initOptions = mockI18nInstance.init.mock.calls[0][0]
    expect(initOptions.interpolation.escapeValue).toBe(false)
  })

  it('detection 配置顺序、缓存、语言转换函数正常', async () => {
    await import('./index')
    const initOptions = mockI18nInstance.init.mock.calls[0][0]
    const detection = initOptions.detection

    expect(detection.order).toEqual(['localStorage', 'navigator'])
    expect(detection.caches).toEqual(['localStorage'])

    const convert = detection.convertDetectedLanguage

    expect(convert('zh-TW')).toBe('zh-CN')
    expect(convert('zh-HK')).toBe('zh-CN')
    expect(convert('ko')).toBe('ko-KR')
    expect(convert('ko-KR')).toBe('ko-KR')
    expect(convert('en-US')).toBe('en-US')
  })

  it('debug 跟随 import.meta.env.DEV 环境变量', async () => {
    vi.stubEnv('DEV', true)
    await import('./index')
    let opts = mockI18nInstance.init.mock.calls[0][0]
    expect(opts.debug).toBe(true)

    vi.resetModules()
    mockI18nInstance.init.mockClear()

    vi.stubEnv('DEV', false)
    await import('./index')
    opts = mockI18nInstance.init.mock.calls[0][0]
    expect(opts.debug).toBe(false)

    vi.unstubAllEnvs()
  })
})
