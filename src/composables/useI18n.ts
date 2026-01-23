import { useI18n as useVueI18n } from 'vue-i18n'
import { useSettingStore } from '@/store/setting'
import { supportedLocales } from '@/i18n'

export function useI18n() {
  const i18n = useVueI18n()
  const settingStore = useSettingStore()

  // 获取当前语言
  const currentLocale = computed(() => settingStore.setting.language)

  // 获取支持的语言列表
  const locales = supportedLocales

  // 切换语言
  const switchLocale = (locale: string) => {
    settingStore.setLanguage(locale)
  }

  // 获取当前语言标签
  const currentLocaleLabel = computed(() => {
    const current = locales.find((l) => l.value === currentLocale.value)
    return current?.label || 'Unknown'
  })

  return {
    ...i18n,
    currentLocale,
    currentLocaleLabel,
    locales,
    switchLocale
  }
}
