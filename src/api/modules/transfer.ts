/**
 * 传输信息模块
 * Transfer Info API
 */

import { get, post } from '../http'
import type { TransferInfo } from '../types'
import { useSessionStore } from '@/store/session'
import { compareVersion } from '@/utils'

/**
 * 获取全局传输信息
 * GET /transfer/info
 */
export async function getInfo(): Promise<TransferInfo> {
  return get<TransferInfo>('/transfer/info')
}

/**
 * 获取备用速度限制状态
 * GET /transfer/speedLimitsMode
 * @returns 1 表示启用备用速度限制（通常是夜间限速），0 表示使用正常速度限制
 */
export async function getSpeedLimitsMode(): Promise<number> {
  const result = await get<string>('/transfer/speedLimitsMode')
  return parseInt(result)
}

/**
 * 切换备用速度限制
 * POST /transfer/toggleSpeedLimitsMode
 * @description 切换正常速度限制和备用速度限制模式
 */
export async function toggleSpeedLimitsMode(): Promise<void> {
  await post('/transfer/toggleSpeedLimitsMode')
}

/**
 * 获取全局下载速度限制
 * GET /transfer/downloadLimit
 * @returns 下载速度限制（字节/秒）
 */
export async function getDownloadLimit(): Promise<number> {
  return get<number>('/transfer/downloadLimit')
}

/**
 * 设置全局下载速度限制
 * POST /transfer/setDownloadLimit
 * @param limit 下载速度限制（字节/秒）
 */
export async function setDownloadLimit(limit: number): Promise<void> {
  await post('/transfer/setDownloadLimit', { limit })
}

/**
 * 获取全局上传速度限制
 * GET /transfer/uploadLimit
 * @returns 上传速度限制（字节/秒）
 */
export async function getUploadLimit(): Promise<number> {
  return get<number>('/transfer/uploadLimit')
}

/**
 * 设置全局上传速度限制
 * POST /transfer/setUploadLimit
 * @param limit 上传速度限制（字节/秒）
 */
export async function setUploadLimit(limit: number): Promise<void> {
  await post('/transfer/setUploadLimit', { limit })
}

/**
 * 封禁 peers
 * POST /transfer/banPeers
 * @requires API v2.3.0+
 * @param peers peer 列表，格式为 "host:port"
 */
export async function banPeers(peers: string[]): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // API v2.3.0 approx qB 4.2.0
  if (version && compareVersion(version, '4.2.0') < 0) {
    console.warn('banPeers requires qBittorrent v4.2.0+')
    return
  }
  await post('/transfer/banPeers', { peers: peers.join('|') })
}
