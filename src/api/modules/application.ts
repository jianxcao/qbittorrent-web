/**
 * 应用模块
 * Application API
 */

import { get, post } from '../http'
import type { AppPreferences, BuildInfo } from '../types'
import { useSessionStore } from '@/store/session'
import { compareVersion } from '@/utils'

/**
 * 获取应用版本
 * GET /app/version
 */
export async function getVersion(): Promise<string> {
  return get<string>('/app/version')
}

/**
 * 获取 API 版本
 * GET /app/webapiVersion
 */
export async function getWebApiVersion(): Promise<string> {
  return get<string>('/app/webapiVersion')
}

/**
 * 获取构建信息
 * GET /app/buildInfo
 */
export async function getBuildInfo(): Promise<BuildInfo> {
  return get<BuildInfo>('/app/buildInfo')
}

/**
 * 关闭应用
 * POST /app/shutdown
 */
export async function shutdown(): Promise<void> {
  await post('/app/shutdown')
}

/**
 * 获取应用偏好设置
 * GET /app/preferences
 */
export async function getPreferences(): Promise<AppPreferences> {
  return get<AppPreferences>('/app/preferences')
}

/**
 * 设置应用偏好设置
 * POST /app/setPreferences
 * @param prefs 偏好设置对象
 */
export async function setPreferences(prefs: Partial<AppPreferences>): Promise<void> {
  await post('/app/setPreferences', { json: JSON.stringify(prefs) })
}

/**
 * 获取默认保存路径
 * GET /app/defaultSavePath
 */
export async function getDefaultSavePath(): Promise<string> {
  return get<string>('/app/defaultSavePath')
}

/**
 * 获取 Cookies 配置
 * GET /app/cookies
 * @requires API v2.11.3+ (qBittorrent v5.0+)
 * @returns 域名到 cookie 值的映射
 */
export async function getCookies(): Promise<Record<string, string>> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  if (version && compareVersion(version, '5.0.0') < 0) {
    console.warn('getCookies is not supported in this version')
    return {}
  }
  return get<Record<string, string>>('/app/cookies')
}

/**
 * 设置 Cookies 配置
 * POST /app/setCookies
 * @requires API v2.11.3+ (qBittorrent v5.0+)
 * @param cookies 域名到 cookie 值的映射，这些 cookies 会在访问对应域名的 tracker 时自动发送
 */
export async function setCookies(cookies: Record<string, string>): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  if (version && compareVersion(version, '5.0.0') < 0) {
    console.warn('setCookies is not supported in this version')
    return
  }
  await post('/app/setCookies', { cookies: JSON.stringify(cookies) })
}

/**
 * 获取网络接口列表
 * GET /app/networkInterfaceList
 * @returns 网络接口列表，包含名称和值
 */
export async function getNetworkInterfaceList(): Promise<Array<{ name: string; value: string }>> {
  return get<Array<{ name: string; value: string }>>('/app/networkInterfaceList')
}

/**
 * 获取指定网络接口的 IP 地址列表
 * GET /app/networkInterfaceAddressList
 * @param iface 网络接口名称，为空则获取所有接口的地址
 * @returns IP 地址字符串数组
 */
export async function getNetworkInterfaceAddressList(iface: string = ''): Promise<string[]> {
  return get<string[]>('/app/networkInterfaceAddressList', { iface })
}
