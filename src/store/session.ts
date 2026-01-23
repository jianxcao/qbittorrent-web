import { sleep } from '@/utils'
import { useSettingStore } from '@/store/setting'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BuildInfo } from '@/api'
import { getBuildInfo, getVersion } from '@/api/modules/application'
import { login as loginApi, logout as logoutApi } from '@/api/modules/auth'

export const useSessionStore = defineStore('session', () => {
  const version = ref<string | null>(null)
  const fetchVersion = async () => {
    const res = await getVersion()
    version.value = res
  }
  const buildInfo = ref<BuildInfo | null>(null)
  const fetchBuildInfo = async () => {
    const res = await getBuildInfo()
    buildInfo.value = res
  }

  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password)
    if (res) {
      return true
    }
    return false
  }

  const logout = async () => {
    const res = await logoutApi()
    if (res) {
      return true
    }
    return false
  }

  return { version, fetchVersion, buildInfo, fetchBuildInfo, login, logout }
})
