/**
 * 搜索模块
 * Search API
 */

import { get, post } from '../http'
import type { SearchPlugin, SearchStatus, SearchResult } from '../types'

/**
 * 开始搜索
 * POST /search/start
 * @param pattern 搜索关键词
 * @param plugins 插件名称列表（多个用 | 分隔，"all" 表示所有插件，"enabled" 表示所有启用的插件）
 * @param category 搜索分类（"all" 表示所有分类）
 * @returns 搜索任务 ID
 */
export async function start(pattern: string, plugins: string, category: string): Promise<{ id: number }> {
  return post<{ id: number }>('/search/start', {
    pattern,
    plugins,
    category
  })
}

/**
 * 停止搜索
 * POST /search/stop
 */
export async function stop(id: number): Promise<void> {
  await post('/search/stop', { id })
}

/**
 * 获取搜索状态
 * GET /search/status
 * @param id 搜索任务 ID（可选，如果省略，返回所有搜索任务的状态）
 */
export async function getStatus(id?: number): Promise<SearchStatus[]> {
  const params = id !== undefined ? { id } : undefined
  return get<SearchStatus[]>('/search/status', params)
}

/**
 * 获取搜索结果
 * GET /search/results
 * @param id 搜索任务 ID
 * @param limit 返回结果数量限制（可选）
 * @param offset 结果偏移量（可选，用于分页）
 */
export async function getResults(
  id: number,
  limit?: number,
  offset?: number
): Promise<{
  results: SearchResult[]
  status: string
  total: number
}> {
  const params: any = { id }
  if (limit !== undefined) {
    params.limit = limit
  }
  if (offset !== undefined) {
    params.offset = offset
  }
  return get('/search/results', params)
}

/**
 * 删除搜索任务
 * POST /search/delete
 */
export async function deleteSearch(id: number): Promise<void> {
  await post('/search/delete', { id })
}

/**
 * 获取搜索插件列表
 * GET /search/plugins
 */
export async function getPlugins(): Promise<SearchPlugin[]> {
  return get<SearchPlugin[]>('/search/plugins')
}

/**
 * 安装搜索插件
 * POST /search/installPlugin
 * @param sources 插件源地址列表（多个用 | 分隔）
 */
export async function installPlugin(sources: string[]): Promise<void> {
  await post('/search/installPlugin', {
    sources: sources.join('|')
  })
}

/**
 * 卸载搜索插件
 * POST /search/uninstallPlugin
 * @param names 插件名称列表（多个用 | 分隔）
 */
export async function uninstallPlugin(names: string[]): Promise<void> {
  await post('/search/uninstallPlugin', {
    names: names.join('|')
  })
}

/**
 * 启用/禁用搜索插件
 * POST /search/enablePlugin
 * @param names 插件名称列表（多个用 | 分隔）
 * @param enable 是否启用
 */
export async function enablePlugin(names: string[], enable: boolean): Promise<void> {
  await post('/search/enablePlugin', {
    names: names.join('|'),
    enable
  })
}

/**
 * 更新搜索插件
 * POST /search/updatePlugins
 */
export async function updatePlugins(): Promise<void> {
  await post('/search/updatePlugins')
}
