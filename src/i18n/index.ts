import { createI18n } from 'vue-i18n'

// 导入语言文件
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

// 消息配置
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
} as const

type SupportedLocales = keyof typeof messages

// 支持的语言列表
export const supportedLocales = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
]

// 获取默认语言
function getDefaultLocale(): string {
  // 优先从设置中获取
  const settingData = localStorage.getItem('setting')
  if (settingData) {
    try {
      const setting = JSON.parse(settingData)
      if (setting.language && supportedLocales.some((locale) => locale.value === setting.language)) {
        return setting.language
      }
    } catch (e) {
      // 解析失败，继续检查其他方式
    }
  }

  // 从独立的语言存储获取
  const saved = localStorage.getItem('qbittorrent-web-locale')
  if (saved && supportedLocales.some((locale) => locale.value === saved)) {
    return saved
  }

  // 检查浏览器语言
  const browserLocale = navigator.language
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN'
  }

  return 'en-US'
}

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'en-US',
  messages,
  globalInjection: true, // 全局注入 $t
  silentTranslationWarn: true,
  silentFallbackWarn: true
})

// 切换语言的函数
export function setLocale(locale: string) {
  if (supportedLocales.some((l) => l.value === locale)) {
    i18n.global.locale.value = locale as SupportedLocales
    localStorage.setItem('transmission-web-locale', locale)

    // 更新 HTML 的 lang 属性
    document.documentElement.setAttribute('lang', locale)
  }
}

// 获取当前语言
export function getCurrentLocale() {
  return i18n.global.locale.value
}

export default i18n
