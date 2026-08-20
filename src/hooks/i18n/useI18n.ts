import { useTranslation } from 'react-i18next'

/**
 *
 * @returns t 切换语言的工具
 * @returns language 当前语言
 * @returns changeLocale 语言切换方法
 */
export default function useI18n() {
  const { t, i18n } = useTranslation()

  const changeLocale = (lng: 'zh-CN' | 'en' | 'ko-KR') => i18n.changeLanguage(lng)

  const lang = i18n.language === 'ko-KR' ? '한국어' : i18n.language === 'zh-CN' ? '中文' : 'English'

  return {
    t,
    lang,
    changeLocale
  }
}
