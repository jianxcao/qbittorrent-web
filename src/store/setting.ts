import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useThemeVars, type CustomThemeCommonVars, type ThemeCommonVars } from 'naive-ui'
import { setLocale } from '@/i18n'
import * as applicationApi from '@/api/modules/application'
import * as transferApi from '@/api/modules/transfer'
import type { AppPreferences } from '@/api/types'

const DEFAULT_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://explodie.org:6969/announce',
  'udp://wepzone.net:6969/announce',
  'udp://ttk2.nbaonlineservice.com:6969/announce',
  'udp://tracker.tryhackx.org:6969/announce',
  'udp://tracker.theoks.net:6969/announce',
  'udp://tracker.srv00.com:6969/announce',
  'udp://tracker.ololosh.space:6969/announce',
  'udp://tracker.fnix.net:6969/announce',
  'udp://tracker.dler.org:6969/announce',
  'udp://t.overflow.biz:6969/announce',
  'udp://retracker01-msk-virt.corbina.net:80/announce',
  'udp://public.tracker.vraphim.com:6969/announce',
  'udp://p4p.arenabg.com:1337/announce',
  'udp://opentracker.io:6969/announce',
  'udp://open.dstud.io:6969/announce'
]

export interface IPolling {
  torrentDetailInterval: number
  torrentInterval: number
}

export const useSettingStore = defineStore('setting', () => {
  const setting = useStorage(
    'setting',
    {
      theme: 'light',
      language: 'zh-CN',
      defaultTrackers: DEFAULT_TRACKERS,
      domain: window.location.origin,
      singleLine: true,
      polling: {
        torrentDetailInterval: 3,
        torrentInterval: 3
      },
      menuExpandedKeys: ['status', 'categories', 'tags', 'dir']
    },
    localStorage,
    { mergeDefaults: true, deep: true, writeDefaults: true }
  )
  // 侧边栏宽度
  const sidebarWidth = useStorage('sidebarWidth', 224, undefined)

  // 详情高度-pc 端生效
  const detailHeight = useStorage('detailHeight', 280)

  const headerHeight = ref(56)
  const footerHeight = ref(32)
  const preferences = ref<AppPreferences>({} as AppPreferences)

  // 限速模式状态：0=正常限速，1=备用限速
  const speedLimitMode = ref<number>(0)

  function setDomain(val: string) {
    setting.value.domain = val
  }

  setDomain(setting.value.domain)

  // 初始化语言设置
  watchEffect(() => {
    if (setting.value.language) {
      setLocale(setting.value.language)
    }
  })

  const serverHost = computed(() => {
    return setting.value.domain.replace(/^https?:\/\//, '')
  })

  const safeArea = reactive({
    top: 0,
    bottom: 0
  })

  const doc = document.documentElement
  const docStyle = window.getComputedStyle(doc)
  safeArea.top = parseInt(docStyle.getPropertyValue('--top-inset')) || 0
  safeArea.bottom = parseInt(docStyle.getPropertyValue('--bottom-inset')) || 0
  const themeDefault = useThemeVars()

  const themeVars = ref<ThemeCommonVars & CustomThemeCommonVars>(themeDefault.value)

  const lineHeight = computed(() => {
    if (themeVars.value.lineHeight && themeVars.value.lineHeight.endsWith('px')) {
      return parseInt(themeVars.value.lineHeight)
    }
    return Math.round(parseInt(themeVars.value.fontSize) * parseFloat(themeVars.value.lineHeight)) || 22
  })

  const lineHeightMini = computed(() => {
    return Number(Math.round(parseInt(themeVars.value.fontSizeMini) * 1.2).toFixed(0))
  })

  function setTheme(val: string) {
    setting.value.theme = val
  }

  function setLanguage(val: string) {
    setting.value.language = val
    setLocale(val)
  }

  function setThemeVars(val: ThemeCommonVars & CustomThemeCommonVars) {
    themeVars.value = val
  }

  function setPolling(val: IPolling) {
    setting.value.polling = val
  }

  async function fetchPreferences() {
    try {
      preferences.value = await applicationApi.getPreferences()
    } catch (error) {
      console.error('Failed to fetch preferences', error)
    }
  }

  async function setPreferences(prefs: Partial<AppPreferences>) {
    try {
      await applicationApi.setPreferences(prefs)
      // fetchPreferences() // Optionally refresh, but backend might not update immediately or we might trust our own optimistic update or just wait for next poll
    } catch (error) {
      console.error('Failed to set preferences', error)
      throw error // Re-throw so components can handle UI feedback
    }
  }

  // 获取当前限速模式
  async function fetchSpeedLimitMode() {
    try {
      speedLimitMode.value = await transferApi.getSpeedLimitsMode()
    } catch (error) {
      console.error('Failed to fetch speed limit mode:', error)
    }
  }

  // 切换限速模式
  async function toggleSpeedLimitMode() {
    try {
      await transferApi.toggleSpeedLimitsMode()
      await fetchSpeedLimitMode()
      return speedLimitMode.value
    } catch (error) {
      console.error('Failed to toggle speed limit mode:', error)
      throw error
    }
  }

  return {
    setting,
    preferences,
    fetchPreferences,
    setPreferences,
    setTheme,
    setLanguage,
    themeVars,
    setThemeVars,
    safeArea,
    lineHeight,
    lineHeightMini,
    serverHost,
    setDomain,
    setPolling,
    sidebarWidth,
    detailHeight,
    headerHeight,
    footerHeight,
    speedLimitMode,
    fetchSpeedLimitMode,
    toggleSpeedLimitMode
  }
})
