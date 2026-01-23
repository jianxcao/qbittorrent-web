/**
 * 同步模块
 * Sync API
 */

import { get } from '../http'
import type { SyncMainData, SyncTorrentPeers, Category } from '../types'

/**
 * 获取主数据（用于同步）
 * GET /sync/maindata
 * @param rid 响应 ID，用于增量同步（首次调用不传或传 0，后续调用传递上次响应的 rid 实现增量同步）
 */
export async function getMainData(rid?: number): Promise<SyncMainData> {
  const params = rid !== undefined ? { rid } : { rid: 0 }
  const data = await get<SyncMainData>('/sync/maindata', params)

  // 兼容性处理：v4.1.0-4.1.2 返回 categories 为数组
  if (data.categories && Array.isArray(data.categories)) {
    const categoriesObj: Record<string, Category> = {}
    ;(data.categories as any[]).forEach((cat: any) => {
      if (typeof cat === 'string') {
        categoriesObj[cat] = { name: cat, savePath: '' }
      } else if (cat.name) {
        categoriesObj[cat.name] = cat
      }
    })
    data.categories = categoriesObj
  }

  return data
}

/**
 * 获取种子 peers 数据（用于同步）
 * GET /sync/torrentPeers
 * @param hash 种子哈希值
 * @param rid 响应 ID，用于增量同步（首次调用不传或传 0，后续调用传递上次响应的 rid）
 */
export async function getTorrentPeers(hash: string, rid?: number): Promise<SyncTorrentPeers> {
  const params: any = { hash }
  if (rid !== undefined) {
    params.rid = rid
  }
  return get<SyncTorrentPeers>('/sync/torrentPeers', params)
}
