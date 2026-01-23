/**
 * 种子管理模块
 * Torrent Management API
 */

import { get, post, postMultipart, hashesToParam, httpClient } from '../http'
import type { Torrent, TorrentProperties, Tracker, WebSeed, TorrentFile, Category } from '../types'
import { useSessionStore } from '@/store/session'
import { compareVersion } from '@/utils'

// ==================== 查询相关 ====================

/**
 * 获取种子列表
 * GET /torrents/info
 * @param params 查询参数
 * @param params.filter - 过滤条件（all、downloading、seeding、completed、paused、active、inactive、resumed、stalled、stalled_uploading、stalled_downloading、errored）
 * @param params.category - 按分类过滤
 * @param params.tag - 按标签过滤（API v2.8.3+）
 * @param params.sort - 排序字段
 * @param params.reverse - 是否倒序
 * @param params.limit - 返回数量限制
 * @param params.offset - 偏移量
 * @param params.hashes - 特定种子哈希列表（多个用 | 分隔）
 */
export async function getList(params?: {
  filter?:
    | 'all'
    | 'downloading'
    | 'seeding'
    | 'completed'
    | 'paused'
    | 'active'
    | 'inactive'
    | 'resumed'
    | 'stalled'
    | 'stalled_uploading'
    | 'stalled_downloading'
    | 'errored'
  category?: string
  tag?: string
  sort?: string
  reverse?: boolean
  limit?: number
  offset?: number
  hashes?: string | string[]
}): Promise<Torrent[]> {
  const queryParams: any = { ...params }
  if (params?.hashes) {
    queryParams.hashes = hashesToParam(params.hashes)
  }
  return get<Torrent[]>('/torrents/info', queryParams)
}

/**
 * 获取种子属性（详细信息）
 * GET /torrents/properties
 */
export async function getProperties(hash: string): Promise<TorrentProperties> {
  return get<TorrentProperties>('/torrents/properties', { hash })
}

/**
 * 获取种子 trackers
 * GET /torrents/trackers
 */
export async function getTrackers(hash: string): Promise<Tracker[]> {
  return get<Tracker[]>('/torrents/trackers', { hash })
}

/**
 * 获取种子 web seeds
 * GET /torrents/webseeds
 */
export async function getWebSeeds(hash: string): Promise<WebSeed[]> {
  return get<WebSeed[]>('/torrents/webseeds', { hash })
}

/**
 * 获取种子文件列表
 * GET /torrents/files
 * @param hash 种子哈希值
 * @param indexes 文件索引列表（可选，API v2.8.2+，多个用 | 分隔）
 */
export async function getFiles(hash: string, indexes?: number[]): Promise<TorrentFile[]> {
  const params: any = { hash }
  if (indexes) {
    params.indexes = indexes.join('|')
  }
  return get<TorrentFile[]>('/torrents/files', params)
}

/**
 * 获取种子分片状态
 * GET /torrents/pieceStates
 */
export async function getPieceStates(hash: string): Promise<number[]> {
  return get<number[]>('/torrents/pieceStates', { hash })
}

/**
 * 获取种子分片哈希
 * GET /torrents/pieceHashes
 */
export async function getPieceHashes(hash: string): Promise<string[]> {
  return get<string[]>('/torrents/pieceHashes', { hash })
}

// ==================== 添加种子 ====================

/**
 * 添加种子
 * POST /torrents/add
 * @param params 添加种子的参数
 * @param params.urls - 种子 URL 或磁力链接（多个用换行分隔）
 * @param params.torrents - 种子文件
 * @param params.savepath - 保存路径
 * @param params.cookie - Cookie（仅 qBittorrent v4.x 支持，v5.0+ 已移除，请使用 /app/setCookies API）
 * @param params.category - 分类
 * @param params.tags - 标签（逗号分隔，API v2.6.2+）
 * @param params.skip_checking - 跳过哈希检查
 * @param params.paused - 添加时暂停
 * @param params.root_folder - 创建根目录
 * @param params.rename - 重命名种子
 * @param params.upLimit - 上传速度限制（字节/秒）
 * @param params.dlLimit - 下载速度限制（字节/秒）
 * @param params.ratioLimit - 分享率限制（API v2.8.1+，-2 使用全局设置，-1 无限制）
 * @param params.seedingTimeLimit - 做种时间限制（分钟，API v2.8.1+，-2 使用全局设置，-1 无限制）
 * @param params.autoTMM - 自动种子管理
 * @param params.sequentialDownload - 顺序下载
 * @param params.firstLastPiecePrio - 首尾片段优先
 */
export async function add(params: {
  urls?: string // 种子 URL 或磁力链接（多个用换行分隔）
  torrents?: File | File[] // 种子文件
  savepath?: string // 保存路径
  cookie?: string // Cookie
  category?: string // 分类
  tags?: string // 标签（逗号分隔）
  skip_checking?: boolean // 跳过哈希检查
  paused?: boolean // 添加时暂停
  root_folder?: boolean // 创建根目录
  rename?: string // 重命名种子
  upLimit?: number // 上传速度限制（字节/秒）
  dlLimit?: number // 下载速度限制（字节/秒）
  ratioLimit?: number // 分享率限制
  seedingTimeLimit?: number // 做种时间限制（分钟）
  autoTMM?: boolean // 自动种子管理
  sequentialDownload?: boolean // 顺序下载
  firstLastPiecePrio?: boolean // 首尾片段优先
  // 不一定支持，文档么有，但是调用有
  addToTopOfQueue?: boolean // 添加到队列顶部
  stopCondition?: 'None' | 'MetadataReceived' | 'FilesChecked'
  contentLayout?: 'Original' | 'Subfolder' | 'NoSubfolder'
}): Promise<string> {
  const formData = new FormData()

  if (params.urls) {
    formData.append('urls', params.urls)
  }
  if (params.torrents) {
    const files = Array.isArray(params.torrents) ? params.torrents : [params.torrents]
    files.forEach((file) => formData.append('torrents', file))
  }
  if (params.savepath) {
    formData.append('savepath', params.savepath)
  }
  if (params.cookie) {
    const sessionStore = useSessionStore()
    const version = sessionStore.version
    // Default to v5+ (no cookie) if version is unknown or >= 5.0.0
    // Only send cookie if we are sure it is < 5.0.0
    const isV4 = version && compareVersion(version, '5.0.0') < 0
    if (isV4) {
      formData.append('cookie', params.cookie)
    }
  }
  if (params.category) {
    formData.append('category', params.category)
  }
  if (params.tags) {
    formData.append('tags', params.tags)
  }
  if (params.skip_checking !== undefined) {
    formData.append('skip_checking', String(params.skip_checking))
  }
  if (params.paused !== undefined) {
    formData.append('paused', String(params.paused))
  }
  if (params.root_folder !== undefined) {
    formData.append('root_folder', String(params.root_folder))
  }
  if (params.rename) {
    formData.append('rename', params.rename)
  }
  if (params.upLimit !== undefined) {
    formData.append('upLimit', String(params.upLimit))
  }
  if (params.dlLimit !== undefined) {
    formData.append('dlLimit', String(params.dlLimit))
  }
  if (params.ratioLimit !== undefined) {
    formData.append('ratioLimit', String(params.ratioLimit))
  }
  if (params.seedingTimeLimit !== undefined) {
    formData.append('seedingTimeLimit', String(params.seedingTimeLimit))
  }
  if (params.autoTMM !== undefined) {
    formData.append('autoTMM', String(params.autoTMM))
  }
  if (params.sequentialDownload !== undefined) {
    formData.append('sequentialDownload', String(params.sequentialDownload))
  }
  if (params.firstLastPiecePrio !== undefined) {
    formData.append('firstLastPiecePrio', String(params.firstLastPiecePrio))
  }
  if (params.addToTopOfQueue !== undefined) {
    formData.append('addToTopOfQueue', String(params.addToTopOfQueue))
  }

  if (params.stopCondition) {
    formData.append('stopCondition', params.stopCondition)
  }

  return postMultipart<string>('/torrents/add', formData)
}

// ==================== 控制操作 ====================

/**
 * 暂停种子
 * POST /torrents/pause (v4)
 * POST /torrents/stop (v5)
 */
export async function pause(hashes: string | string[]): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // Default to v5+ (stop)
  const isV4 = version && compareVersion(version, '5.0.0') < 0
  const endpoint = isV4 ? '/torrents/pause' : '/torrents/stop'
  await post(endpoint, { hashes: hashesToParam(hashes) })
}

/**
 * 恢复种子
 * POST /torrents/resume (v4)
 * POST /torrents/start (v5)
 */
export async function resume(hashes: string | string[]): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // Default to v5+ (start)
  const isV4 = version && compareVersion(version, '5.0.0') < 0
  const endpoint = isV4 ? '/torrents/resume' : '/torrents/start'
  await post(endpoint, { hashes: hashesToParam(hashes) })
}

/**
 * 删除种子
 * POST /torrents/delete
 */
export async function remove(hashes: string | string[], deleteFiles = false): Promise<void> {
  await post('/torrents/delete', {
    hashes: hashesToParam(hashes),
    deleteFiles
  })
}

/**
 * 重新检查种子
 * POST /torrents/recheck
 */
export async function recheck(hashes: string | string[]): Promise<void> {
  await post('/torrents/recheck', { hashes: hashesToParam(hashes) })
}

/**
 * 重新向 tracker 宣告
 * POST /torrents/reannounce
 * @requires API v2.0.2+
 */
export async function reannounce(hashes: string | string[]): Promise<void> {
  await post('/torrents/reannounce', { hashes: hashesToParam(hashes) })
}

// ==================== Tracker 管理 ====================

/**
 * 添加 trackers 到种子
 * POST /torrents/addTrackers
 */
export async function addTrackers(hash: string, urls: string[]): Promise<void> {
  await post('/torrents/addTrackers', {
    hash,
    urls: urls.join('\n')
  })
}

/**
 * 编辑 tracker
 * POST /torrents/editTracker
 * @requires API v2.2.0+
 */
export async function editTracker(hash: string, origUrl: string, newUrl: string): Promise<void> {
  await post('/torrents/editTracker', {
    hash,
    origUrl,
    newUrl
  })
}

/**
 * 删除 trackers
 * POST /torrents/removeTrackers
 * @requires API v2.2.0+
 */
export async function removeTrackers(hash: string, urls: string[]): Promise<void> {
  await post('/torrents/removeTrackers', {
    hash,
    urls: urls.join('|')
  })
}

// ==================== Peer 管理 ====================

/**
 * 添加 peers
 * POST /torrents/addPeers
 * @requires API v2.3.0+
 */
export async function addPeers(hashes: string | string[], peers: string[]): Promise<void> {
  await post('/torrents/addPeers', {
    hashes: hashesToParam(hashes),
    peers: peers.join('|')
  })
}

// ==================== 优先级管理 ====================

/**
 * 提高种子优先级
 * POST /torrents/increasePrio
 */
export async function increasePriority(hashes: string | string[]): Promise<void> {
  await post('/torrents/increasePrio', { hashes: hashesToParam(hashes) })
}

/**
 * 降低种子优先级
 * POST /torrents/decreasePrio
 */
export async function decreasePriority(hashes: string | string[]): Promise<void> {
  await post('/torrents/decreasePrio', { hashes: hashesToParam(hashes) })
}

/**
 * 设置最高优先级
 * POST /torrents/topPrio
 */
export async function setTopPriority(hashes: string | string[]): Promise<void> {
  await post('/torrents/topPrio', { hashes: hashesToParam(hashes) })
}

/**
 * 设置最低优先级
 * POST /torrents/bottomPrio
 */
export async function setBottomPriority(hashes: string | string[]): Promise<void> {
  await post('/torrents/bottomPrio', { hashes: hashesToParam(hashes) })
}

/**
 * 设置文件优先级
 * POST /torrents/filePrio
 */
export async function setFilePriority(hash: string, id: number | number[], priority: 0 | 1 | 6 | 7): Promise<void> {
  const ids = Array.isArray(id) ? id.join('|') : String(id)
  await post('/torrents/filePrio', {
    hash,
    id: ids,
    priority
  })
}

// ==================== 速度限制 ====================

/**
 * 获取种子下载速度限制
 * GET /torrents/downloadLimit
 */
export async function getDownloadLimit(hashes: string | string[]): Promise<Record<string, number>> {
  return get<Record<string, number>>('/torrents/downloadLimit', {
    hashes: hashesToParam(hashes)
  })
}

/**
 * 设置种子下载速度限制
 * POST /torrents/setDownloadLimit
 */
export async function setDownloadLimit(hashes: string | string[], limit: number): Promise<void> {
  await post('/torrents/setDownloadLimit', {
    hashes: hashesToParam(hashes),
    limit
  })
}

/**
 * 获取种子上传速度限制
 * GET /torrents/uploadLimit
 */
export async function getUploadLimit(hashes: string | string[]): Promise<Record<string, number>> {
  return get<Record<string, number>>('/torrents/uploadLimit', {
    hashes: hashesToParam(hashes)
  })
}

/**
 * 设置种子上传速度限制
 * POST /torrents/setUploadLimit
 */
export async function setUploadLimit(hashes: string | string[], limit: number): Promise<void> {
  await post('/torrents/setUploadLimit', {
    hashes: hashesToParam(hashes),
    limit
  })
}

/**
 * 设置种子分享限制
 * POST /torrents/setShareLimits
 * @requires API v2.0.1+
 */
export async function setShareLimits(
  hashes: string | string[],
  ratioLimit?: number,
  seedingTimeLimit?: number,
  inactiveSeedingTimeLimit?: number
): Promise<void> {
  const params: any = { hashes: hashesToParam(hashes) }
  if (ratioLimit !== undefined) {
    params.ratioLimit = ratioLimit
  }
  if (seedingTimeLimit !== undefined) {
    params.seedingTimeLimit = seedingTimeLimit
  }
  if (inactiveSeedingTimeLimit !== undefined) {
    params.inactiveSeedingTimeLimit = inactiveSeedingTimeLimit
  }
  await post('/torrents/setShareLimits', params)
}

// ==================== 位置和命名 ====================

/**
 * 设置种子位置
 * POST /torrents/setLocation
 */
export async function setLocation(hashes: string | string[], location: string): Promise<void> {
  await post('/torrents/setLocation', {
    hashes: hashesToParam(hashes),
    location
  })
}

/**
 * 重命名种子
 * POST /torrents/rename
 */
export async function rename(hash: string, name: string): Promise<void> {
  await post('/torrents/rename', { hash, name })
}

/**
 * 重命名文件
 * POST /torrents/renameFile
 * @requires API v2.4.0+
 */
export async function renameFile(hash: string, oldPath: string, newPath: string): Promise<void> {
  await post('/torrents/renameFile', {
    hash,
    oldPath,
    newPath
  })
}

/**
 * 重命名文件夹
 * POST /torrents/renameFolder
 * @requires API v2.8.0+
 */
export async function renameFolder(hash: string, oldPath: string, newPath: string): Promise<void> {
  await post('/torrents/renameFolder', {
    hash,
    oldPath,
    newPath
  })
}

// ==================== 分类管理 ====================

/**
 * 设置种子分类
 * POST /torrents/setCategory
 */
export async function setCategory(hashes: string | string[], category: string): Promise<void> {
  await post('/torrents/setCategory', {
    hashes: hashesToParam(hashes),
    category
  })
}

/**
 * 获取所有分类
 * GET /torrents/categories
 */
export async function getCategories(): Promise<Record<string, Category>> {
  return get<Record<string, Category>>('/torrents/categories')
}

/**
 * 创建分类
 * POST /torrents/createCategory
 */
export async function createCategory(category: string, savePath: string): Promise<void> {
  await post('/torrents/createCategory', {
    category,
    savePath
  })
}

/**
 * 编辑分类
 * POST /torrents/editCategory
 */
export async function editCategory(category: string, savePath: string): Promise<void> {
  await post('/torrents/editCategory', {
    category,
    savePath
  })
}

/**
 * 删除分类
 * POST /torrents/removeCategories
 */
export async function removeCategories(categories: string[]): Promise<void> {
  await post('/torrents/removeCategories', {
    categories: categories.join('\n')
  })
}

// ==================== 标签管理 ====================

/**
 * 添加标签到种子
 * POST /torrents/addTags
 */
export async function addTags(hashes: string | string[], tags: string[]): Promise<void> {
  await post('/torrents/addTags', {
    hashes: hashesToParam(hashes),
    tags: tags.join(',')
  })
}

/**
 * 从种子移除标签
 * POST /torrents/removeTags
 */
export async function removeTags(hashes: string | string[], tags?: string[]): Promise<void> {
  const params: any = { hashes: hashesToParam(hashes) }
  if (tags) {
    params.tags = tags.join(',')
  }
  await post('/torrents/removeTags', params)
}

/**
 * 获取所有标签
 * GET /torrents/tags
 */
export async function getTags(): Promise<string[]> {
  return get<string[]>('/torrents/tags')
}

/**
 * 创建标签
 * POST /torrents/createTags
 */
export async function createTags(tags: string[]): Promise<void> {
  await post('/torrents/createTags', {
    tags: tags.join(',')
  })
}

/**
 * 删除标签
 * POST /torrents/deleteTags
 */
export async function deleteTags(tags: string[]): Promise<void> {
  await post('/torrents/deleteTags', {
    tags: tags.join(',')
  })
}

// ==================== 高级设置 ====================

/**
 * 设置自动种子管理
 * POST /torrents/setAutoManagement
 */
export async function setAutoManagement(hashes: string | string[], enable: boolean): Promise<void> {
  await post('/torrents/setAutoManagement', {
    hashes: hashesToParam(hashes),
    enable
  })
}

/**
 * 切换顺序下载
 * POST /torrents/toggleSequentialDownload
 */
export async function toggleSequentialDownload(hashes: string | string[]): Promise<void> {
  await post('/torrents/toggleSequentialDownload', {
    hashes: hashesToParam(hashes)
  })
}

/**
 * 切换首尾片段优先
 * POST /torrents/toggleFirstLastPiecePrio
 */
export async function toggleFirstLastPiecePriority(hashes: string | string[]): Promise<void> {
  await post('/torrents/toggleFirstLastPiecePrio', {
    hashes: hashesToParam(hashes)
  })
}

/**
 * 设置强制开始
 * POST /torrents/setForceStart
 */
export async function setForceStart(hashes: string | string[], value: boolean): Promise<void> {
  await post('/torrents/setForceStart', {
    hashes: hashesToParam(hashes),
    value
  })
}

/**
 * 设置超级做种
 * POST /torrents/setSuperSeeding
 */
export async function setSuperSeeding(hashes: string | string[], value: boolean): Promise<void> {
  await post('/torrents/setSuperSeeding', {
    hashes: hashesToParam(hashes),
    value
  })
}

/**
 * 获取导出种子的 URL
 */
export function getExportUrl(hash: string): string {
  const baseURL = httpClient.defaults.baseURL || ''
  // 去除结尾的 slash
  const cleanBaseURL = baseURL.replace(/\/$/, '')
  return `${cleanBaseURL}/torrents/export?hash=${hash}`
}
