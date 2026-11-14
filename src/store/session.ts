import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BuildInfo } from '@/api'
import { getBuildInfo, getVersion, getWebApiVersion } from '@/api/modules/application'
import { setApiKey } from '@/api/http'
import { login as loginApi, logout as logoutApi } from '@/api/modules/auth'
import { useSettingStore } from '@/store/setting'

export const useSessionStore = defineStore('session', () => {
  const version = ref<string | null>(null)
  const webApiVersion = ref<string | null>(null)
  const fetchVersion = async () => {
    const res = await getVersion()
    version.value = res
    try {
      webApiVersion.value = await getWebApiVersion()
    } catch (error) {
      console.error('Failed to fetch WebAPI version:', error)
    }
  }
  const buildInfo = ref<BuildInfo | null>(null)
  const fetchBuildInfo = async () => {
    const res = await getBuildInfo()
    buildInfo.value = res
  }

  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password)
    if (res) {
      setApiKey('')
    }
    return res
  }

  // qBittorrent >= 5.2：用 API Key 访问，不建立 SID cookie。调用方先 setDomain。
  // 探测期间临时带上 key，失败后恢复已保存的 key，避免一次输错清掉本地凭据。
  const loginWithApiKey = async (key: string) => {
    const trimmed = key.trim()
    if (!trimmed) {
      return false
    }
    const settingStore = useSettingStore()
    const previous = settingStore.setting.apiKey || ''
    setApiKey(trimmed)
    try {
      await fetchVersion()
      return true
    } catch (error) {
      setApiKey(previous)
      console.error('API key login failed:', error)
      return false
    }
  }

  const logout = async () => {
    const res = await logoutApi()
    if (res) {
      return true
    }
    return false
  }

  return { version, webApiVersion, fetchVersion, buildInfo, fetchBuildInfo, login, loginWithApiKey, logout }
})
