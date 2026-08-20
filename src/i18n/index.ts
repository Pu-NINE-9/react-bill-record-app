import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import zhCN from './config/zh-CN.json'
import en from './config/en.json'
import kor from './config/ko-KR.json'

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: en
  },
  'zh-CN': {
    translation: zhCN
  },
  'ko-KR': {
    translation: kor
  }
}

i18n
  .use(LanguageDetector) // 持久化语言，localStorage、浏览器语言
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: ['en', 'zh-CN', 'ko-KR'], // language to use
    debug: import.meta.env.DEV,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith('zh')) return 'zh-CN'
        if (lng.startsWith('ko')) return 'ko-KR'
        return lng
      }
    },
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
