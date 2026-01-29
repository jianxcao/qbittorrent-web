import { qbStatusFilterFunMap, qbStatusFilters } from '@/const/status'
import { ShuffleOutline } from '@vicons/ionicons5'
import i18n from '@/i18n'
import { isFunction } from 'lodash-es'
import type { Torrent as BaseTorrent, SyncTorrentPeers, Category } from '@/api/types'
import { useSettingStore } from './setting'

// 扩展 Torrent 类型，添加客户端特定字段
export interface Torrent extends BaseTorrent {
  peersData?: SyncTorrentPeers
  tagsArray?: string[] // tags 字段的数组形式
  trackerHost?: string // tracker 的 hostname
}
export interface IMenuItem {
  icon?: Component
  count: number
  color?: string
  label?: string
}

// 将所有的选项放到 map
export const detailFilterOptions = function (
  t: Torrent,
  tagsSet: Map<string, IMenuItem>,
  trackerSet: Map<string, IMenuItem>,
  errorStringSet: Map<string, IMenuItem>,
  downloadDirSet: Map<string, IMenuItem>,
  statusSet: Map<string, IMenuItem>,
  categoriesSet: Map<string, IMenuItem>,
  globalTags: string[],
  globalCategories: Record<string, Category>
) {
  const $t = i18n.global.t
  const settingStore = useSettingStore()
  // === 1. 统计各种选项（用于生成过滤选项） ===
  // 标签统计 - 使用全局标签列表
  globalTags.forEach((tag: string) => {
    const prev = tagsSet.get(tag)
    // 即使 count 为 0 也要初始化
    tagsSet.set(tag, { count: (prev?.count || 0) + (t.tagsArray?.includes(tag) ? 1 : 0) })
  })
  // 统计无标签的种子
  if (!t.tagsArray || t.tagsArray.length === 0) {
    const prev = tagsSet.get('noTags')
    tagsSet.set('noTags', { count: (prev?.count || 0) + 1, label: $t('common.noTags') })
  }

  // tracker 统计 - 使用qBittorrent字段
  if (t.tracker) {
    let host = t.trackerHost || ''
    if (!host && t.tracker) {
      try {
        host = new URL(t.tracker).hostname
      } catch {
        host = t.tracker
      }
    }
    const prefixMatch = settingStore.ignoredTrackerPrefixesReg.exec(host)
    // console.debug("prefixMatch", prefixMatch, settingStore.ignoredTrackerPrefixesReg)
    if (prefixMatch?.groups !== undefined) {
      host = host.substring(prefixMatch.groups.prefix.length + 1)
    }
    const prev = trackerSet.get(host)
    trackerSet.set(host, { count: (prev?.count || 0) + 1 })
  } else {
    const prev = trackerSet.get('noTracker')
    trackerSet.set('noTracker', { count: (prev?.count || 0) + 1, label: $t('common.noTracker') })
  }

  // error 统计 - 使用qBittorrent字段
  if (t.state === 'error' || t.state === 'missingFiles') {
    const errorMsg = t.state === 'error' ? 'Error' : 'Missing Files'
    const prev = errorStringSet.get(errorMsg)
    errorStringSet.set(errorMsg, { count: (prev?.count || 0) + 1, color: 'var(--error-color)' })
  }

  // 分类统计 - 使用qBittorrent字段
  Object.keys(globalCategories).forEach((categoryName: string) => {
    const prev = categoriesSet.get(categoryName)
    // 即使 count 为 0 也要初始化
    categoriesSet.set(categoryName, { count: (prev?.count || 0) + (t.category === categoryName ? 1 : 0) })
  })
  // 统计无分类的种子
  if (!t.category || t.category === '') {
    const prev = categoriesSet.get('noCategory')
    categoriesSet.set('noCategory', { count: (prev?.count || 0) + 1, label: $t('common.noCategory') })
  }

  // downloadDir 统计 - 使用qBittorrent字段
  if (t.save_path) {
    const prev = downloadDirSet.get(t.save_path)
    downloadDirSet.set(t.save_path, { count: (prev?.count || 0) + 1 })
  }

  // status 统计 - 使用qBittorrent状态过滤器
  qbStatusFilters.forEach((filter) => {
    const prev = statusSet.get(filter.key)
    let count = prev?.count || 0
    if (filter.filter(t)) {
      count++
    }
    statusSet.set(filter.key, {
      icon: filter.icon,
      color: filter.color,
      label: filter.label($t),
      count: count
    })
  })
}

// 将 map 转换成数组
export const mapToOptions = (map: Map<string, IMenuItem>, total: number) => {
  const $t = i18n.global.t
  return [
    { key: 'all', label: `${$t('common.all', { total })}`, icon: ShuffleOutline, count: total, color: undefined } as {
      key: string
      label: string
      color?: string
      icon?: Component
      count: number
    },
    ...Array.from(map.entries()).map(([item, value]) => {
      const label = isFunction(value.label) ? value.label($t) : value.label
      return {
        key: item,
        label: `${label || item}（${value.count}）`,
        color: value?.color,
        icon: value?.icon,
        count: value.count
      } as {
        key: string
        label: string
        color?: string
        icon?: Component
        count: number
      }
    })
  ]
}

// 是否可以过滤这个种子
export const isFilterTorrents = function (
  t: Torrent,
  search: globalThis.Ref<string, string>,
  statusFilter: globalThis.Ref<string, string>,
  tagsFilter: globalThis.Ref<string, string>,
  trackerFilter: globalThis.Ref<string, string>,
  errorStringFilter: globalThis.Ref<string, string>,
  downloadDirFilter: globalThis.Ref<string, string>,
  categoryFilter: globalThis.Ref<string, string>
) {
  // === 2. 同时进行过滤判断 ===
  let shouldInclude = true

  // 搜索过滤
  if (search.value && !t.name.includes(search.value)) {
    shouldInclude = false
  }

  // 状态过滤
  if (
    shouldInclude &&
    statusFilter.value &&
    statusFilter.value !== 'all' &&
    !qbStatusFilterFunMap.get(statusFilter.value)?.(t)
  ) {
    shouldInclude = false
  }

  // 标签过滤 - 使用qBittorrent字段
  if (
    shouldInclude &&
    tagsFilter.value &&
    tagsFilter.value !== 'all' &&
    !(tagsFilter.value == 'noTags' && (!t.tagsArray || t.tagsArray.length === 0)) &&
    !t.tagsArray?.includes(tagsFilter.value)
  ) {
    shouldInclude = false
  }

  // tracker 过滤 - 使用qBittorrent字段
  if (
    shouldInclude &&
    trackerFilter.value &&
    trackerFilter.value !== 'all' &&
    !(trackerFilter.value == 'noTracker' && !t.tracker) &&
    !t.trackerHost?.includes(trackerFilter.value)
  ) {
    shouldInclude = false
  }

  // 错误过滤 - 使用qBittorrent字段
  if (shouldInclude && errorStringFilter.value && errorStringFilter.value !== 'all') {
    const hasError = t.state === 'error' || t.state === 'missingFiles'
    const errorMsg = t.state === 'error' ? 'Error' : t.state === 'missingFiles' ? 'Missing Files' : ''
    if (errorMsg !== errorStringFilter.value) {
      shouldInclude = false
    }
  }

  // 分类过滤 - 使用qBittorrent字段
  if (
    shouldInclude &&
    categoryFilter.value &&
    categoryFilter.value !== 'all' &&
    !(categoryFilter.value == 'noCategory' && (!t.category || t.category === '')) &&
    t.category !== categoryFilter.value
  ) {
    shouldInclude = false
  }

  // 下载目录过滤 - 使用qBittorrent字段
  if (
    shouldInclude &&
    downloadDirFilter.value &&
    downloadDirFilter.value !== 'all' &&
    t.save_path !== downloadDirFilter.value
  ) {
    shouldInclude = false
  }

  return shouldInclude
}

// 排序
export const sortTorrents = function (
  filtered: Torrent[],
  sortKey: globalThis.Ref<string, string>,
  sortOrder: globalThis.Ref<string, string>
) {
  filtered.sort((a, b) => {
    const aValue = a[sortKey.value as keyof Torrent]
    const bValue = b[sortKey.value as keyof Torrent]
    // 处理 undefined/null
    if (aValue == null && bValue == null) {
      return 0
    }
    if (aValue == null) {
      return sortOrder.value === 'asc' ? -1 : 1
    }
    if (bValue == null) {
      return sortOrder.value === 'asc' ? 1 : -1
    }
    // 数字、字符串、日期
    let result = 0
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      result = sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      result = sortOrder.value === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    // 其他类型（如布尔、对象等）
    // result = 0 时，说明字段值相等，需要二次排序
    if (result === 0 && sortKey.value !== 'name') {
      const aName = a.name || ''
      const bName = b.name || ''
      result = aName.localeCompare(bName)
    }
    return result
  })
}

export const portRe = /:\d+$/
export const prefixRe = /^((t|tr|tk|tracker|bt|open|opentracker)\d*)\.[^.]+\.[^.]+$/

// 处理 torrent 数据 - 使用qBittorrent字段
export const processTorrent = (torrent: BaseTorrent): Torrent => {
  // 解析 tags 字符串为数组
  const tagsArray = torrent.tags
    ? torrent.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
    : []

  // 解析 tracker hostname
  let trackerHost = ''
  if (torrent.tracker) {
    try {
      trackerHost = new URL(torrent.tracker).hostname
    } catch {
      trackerHost = torrent.tracker
    }
  }

  return {
    ...torrent,
    // 标准化路径
    save_path: (torrent.save_path as string).replace(/\\/g, '/'),
    // 解析的字段
    tagsArray,
    trackerHost
  } as Torrent
}
