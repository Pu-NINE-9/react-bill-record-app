import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import useI18n from './useI18n'
import { useTranslation } from 'react-i18next'

// mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}))

const mockedUseTranslation = useTranslation as Mock

describe('useI18n hook', () => {
  const mockChangeLanguage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('zh-CN 时 lang = 中文，返回 t、changeLocale 函数', () => {
    mockedUseTranslation.mockReturnValue({
      t: vi.fn((key: string) => key),
      i18n: {
        language: 'zh-CN',
        changeLanguage: mockChangeLanguage
      }
    })

    const { result } = renderHook(() => useI18n())

    expect(result.current.lang).toBe('中文')
    expect(typeof result.current.t).toBe('function')
    expect(typeof result.current.changeLocale).toBe('function')
  })

  it('en 时 lang = English', () => {
    mockedUseTranslation.mockReturnValue({
      t: vi.fn((key: string) => key),
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage
      }
    })

    const { result } = renderHook(() => useI18n())
    expect(result.current.lang).toBe('English')
  })

  it('ko-KR 时 lang = 한국어', () => {
    mockedUseTranslation.mockReturnValue({
      t: vi.fn((key: string) => key),
      i18n: {
        language: 'ko-KR',
        changeLanguage: mockChangeLanguage
      }
    })

    const { result } = renderHook(() => useI18n())
    expect(result.current.lang).toBe('한국어')
  })

  it('changeLocale 调用 i18n.changeLanguage 传入对应语种', async () => {
    mockedUseTranslation.mockReturnValue({
      t: vi.fn((key: string) => key),
      i18n: {
        language: 'zh-CN',
        changeLanguage: mockChangeLanguage
      }
    })

    const { result } = renderHook(() => useI18n())

    await act(async () => {
      result.current.changeLocale('en')
    })
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1)
    expect(mockChangeLanguage).toHaveBeenCalledWith('en')

    await act(async () => {
      result.current.changeLocale('ko-KR')
    })
    expect(mockChangeLanguage).toHaveBeenCalledWith('ko-KR')
  })

  it('t 透传返回 useTranslation 的 t 函数', () => {
    const mockT = vi.fn((k: string) => `trans:${k}`)
    mockedUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'zh-CN',
        changeLanguage: mockChangeLanguage
      }
    })

    const { result } = renderHook(() => useI18n())
    const text = result.current.t('common.cancel')
    expect(mockT).toHaveBeenCalledWith('common.cancel')
    expect(text).toBe('trans:common.cancel')
  })
})
