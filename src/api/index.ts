/**
 * qBittorrent WebUI API 统一入口
 * 基于官方 API v2.8.3 规范
 * https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)
 */

// 导出 HTTP 客户端和工具函数
export { httpClient, setDomain, toFormData, toUrlEncoded, hashesToParam } from './http'

// 导出类型定义
export * from './types'

// 导出各个模块
import * as auth from './modules/auth'
import * as application from './modules/application'
import * as log from './modules/log'
import * as sync from './modules/sync'
import * as transfer from './modules/transfer'
import * as torrents from './modules/torrents'
import * as rss from './modules/rss'
import * as search from './modules/search'

// 统一导出为命名空间
export const qbApi = {
  auth,
  application,
  log,
  sync,
  transfer,
  torrents,
  rss,
  search
}

// 也可以单独导出各个模块
export { auth, application, log, sync, transfer, torrents, rss, search }

// 默认导出
export default qbApi

