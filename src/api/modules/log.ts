/**
 * 日志模块
 * Log API
 */

import { get } from '../http'
import type { LogEntry, PeerLogEntry } from '../types'

/**
 * 获取日志
 * GET /log/main
 * @param params 查询参数
 * @param params.normal 是否包含普通消息（默认 true）
 * @param params.info 是否包含信息消息（默认 true）
 * @param params.warning 是否包含警告消息（默认 true）
 * @param params.critical 是否包含严重消息（默认 true）
 * @param params.last_known_id 最后已知的日志 ID，用于增量获取（传入 -1 表示获取所有日志）
 */
export async function getLog(params?: {
  normal?: boolean
  info?: boolean
  warning?: boolean
  critical?: boolean
  last_known_id?: number
}): Promise<LogEntry[]> {
  return get<LogEntry[]>('/log/main', params)
}

/**
 * 获取 peer 日志
 * GET /log/peers
 * @param last_known_id 最后已知的日志 ID，用于增量获取（传入 -1 表示获取所有 peer 日志）
 */
export async function getPeerLog(last_known_id?: number): Promise<PeerLogEntry[]> {
  const params = last_known_id !== undefined ? { last_known_id } : undefined
  return get<PeerLogEntry[]>('/log/peers', params)
}

