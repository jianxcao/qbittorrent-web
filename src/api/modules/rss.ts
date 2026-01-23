/**
 * RSS 模块
 * RSS API (experimental)
 */

import { get, post } from '../http'
import type { RSSFolder, RSSRule, RSSArticle } from '../types'
import { useSessionStore } from '@/store/session'
import { compareVersion } from '@/utils'

/**
 * 添加 RSS 文件夹
 * POST /rss/addFolder
 */
export async function addFolder(path: string): Promise<void> {
  await post('/rss/addFolder', { path })
}

/**
 * 添加 RSS 订阅
 * POST /rss/addFeed
 */
export async function addFeed(url: string, path?: string): Promise<void> {
  const params: any = { url }
  if (path) {
    params.path = path
  }
  await post('/rss/addFeed', params)
}

/**
 * 删除 RSS 项目（文件夹或订阅）
 * POST /rss/removeItem
 */
export async function removeItem(path: string): Promise<void> {
  await post('/rss/removeItem', { path })
}

/**
 * 移动 RSS 项目
 * POST /rss/moveItem
 */
export async function moveItem(itemPath: string, destPath: string): Promise<void> {
  await post('/rss/moveItem', {
    itemPath,
    destPath
  })
}

/**
 * 获取所有 RSS 项目
 * GET /rss/items
 * @param withData 是否返回包含文章数据的完整信息（默认 false）
 */
export async function getItems(withData = false): Promise<RSSFolder> {
  return get<RSSFolder>('/rss/items', { withData })
}

/**
 * 标记为已读
 * POST /rss/markAsRead
 * @requires API v2.5.1+
 * @param itemPath RSS 项目路径
 * @param articleId 文章 ID（可选，如果省略，标记该 feed 下所有文章为已读）
 */
export async function markAsRead(itemPath: string, articleId?: string): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // API v2.5.1 approx qB 4.2.5
  if (version && compareVersion(version, '4.2.5') < 0) {
    console.warn('markAsRead requires qBittorrent v4.2.5+')
    return
  }

  const params: any = { itemPath }
  if (articleId) {
    params.articleId = articleId
  }
  await post('/rss/markAsRead', params)
}

/**
 * 刷新 RSS 项目
 * POST /rss/refreshItem
 * @requires API v2.2.1+
 */
export async function refreshItem(itemPath: string): Promise<void> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // API v2.2.1 approx qB 4.1.6
  if (version && compareVersion(version, '4.1.6') < 0) {
    console.warn('refreshItem requires qBittorrent v4.1.6+')
    return
  }

  await post('/rss/refreshItem', { itemPath })
}

/**
 * 设置自动下载规则
 * POST /rss/setRule
 */
export async function setRule(ruleName: string, ruleDef: RSSRule): Promise<void> {
  await post('/rss/setRule', {
    ruleName,
    ruleDef: JSON.stringify(ruleDef)
  })
}

/**
 * 重命名自动下载规则
 * POST /rss/renameRule
 */
export async function renameRule(ruleName: string, newRuleName: string): Promise<void> {
  await post('/rss/renameRule', {
    ruleName,
    newRuleName
  })
}

/**
 * 删除自动下载规则
 * POST /rss/removeRule
 */
export async function removeRule(ruleName: string): Promise<void> {
  await post('/rss/removeRule', { ruleName })
}

/**
 * 获取所有自动下载规则
 * GET /rss/rules
 */
export async function getRules(): Promise<Record<string, RSSRule>> {
  return get<Record<string, RSSRule>>('/rss/rules')
}

/**
 * 获取匹配规则的文章
 * GET /rss/matchingArticles
 * @requires API v2.5.1+
 */
export async function getMatchingArticles(ruleName: string): Promise<Record<string, RSSArticle[]>> {
  const sessionStore = useSessionStore()
  const version = sessionStore.version
  // API v2.5.1 approx qB 4.2.5
  if (version && compareVersion(version, '4.2.5') < 0) {
    console.warn('getMatchingArticles requires qBittorrent v4.2.5+')
    return {}
  }
  return get<Record<string, RSSArticle[]>>('/rss/matchingArticles', { ruleName })
}
