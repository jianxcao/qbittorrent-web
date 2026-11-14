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

// 初始化过滤选项 map（只做一次，count 从 0 开始）。
// 移出 per-torrent 循环，消除 O(N × tags + N × categories) 的嵌套遍历，
// 并预计算 status filter 的 label 字符串，避免每 torrent 重复调用 i18n t()。
export const initFilterOptions = function (
  tagsSet: Map<string, IMenuItem>,
  categoriesSet: Map<string, IMenuItem>,
  statusSet: Map<string, IMenuItem>,
  globalTags: string[],
  globalCategories: Record<string, Category>
) {
  const $t = i18n.global.t
  tagsSet.set('noTags', { count: 0, label: $t('common.noTags') })
  for (let i = 0; i < globalTags.length; i++) {
    tagsSet.set(globalTags[i], { count: 0 })
  }
  categoriesSet.set('noCategory', { count: 0, label: $t('common.noCategory') })
  const catKeys = Object.keys(globalCategories)
  for (let i = 0; i < catKeys.length; i++) {
    categoriesSet.set(catKeys[i], { count: 0 })
  }
  // 预计算 status 元数据：icon/color/label 只算一次，count 后续单独累加
  for (let i = 0; i < qbStatusFilters.length; i++) {
    const filter = qbStatusFilters[i]
    statusSet.set(filter.key, {
      icon: filter.icon,
      color: filter.color,
      label: filter.label($t),
      count: 0
    })
  }
}

// 将单个 torrent 累加到各过滤选项 map。
// 每 torrent 只遍历自身 tags 数 + 1 个分类 + statusFilters 数，复杂度线性。
export const detailFilterOptions = function (
  t: Torrent,
  tagsSet: Map<string, IMenuItem>,
  trackerSet: Map<string, IMenuItem>,
  errorStringSet: Map<string, IMenuItem>,
  downloadDirSet: Map<string, IMenuItem>,
  statusSet: Map<string, IMenuItem>,
  categoriesSet: Map<string, IMenuItem>
) {
  const $t = i18n.global.t
  const settingStore = useSettingStore()

  // === 1. 标签统计：只遍历该 torrent 实际拥有的标签 ===
  const tagCounts = t.tagsArray
  if (tagCounts && tagCounts.length > 0) {
    for (let i = 0; i < tagCounts.length; i++) {
      const tag = tagCounts[i]
      const prev = tagsSet.get(tag)
      if (prev) {
        prev.count++
      }
    }
  } else {
    const prev = tagsSet.get('noTags')
    if (prev) {
      prev.count++
    }
  }

  // === 2. tracker 统计 ===
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
    if (prefixMatch?.groups !== undefined) {
      host = host.substring(prefixMatch.groups.prefix.length + 1)
    }
    const prev = trackerSet.get(host)
    trackerSet.set(host, { count: (prev?.count || 0) + 1 })
  } else {
    const prev = trackerSet.get('noTracker')
    trackerSet.set('noTracker', { count: (prev?.count || 0) + 1, label: $t('common.noTracker') })
  }

  // === 3. error 统计 ===
  if (t.state === 'error' || t.state === 'missingFiles') {
    const errorMsg = t.state === 'error' ? 'Error' : 'Missing Files'
    const prev = errorStringSet.get(errorMsg)
    errorStringSet.set(errorMsg, { count: (prev?.count || 0) + 1, color: 'var(--error-color)' })
  }

  // === 4. 分类统计：O(1) 查该 torrent 的分类 ===
  if (t.category) {
    const prev = categoriesSet.get(t.category)
    if (prev) {
      prev.count++
    }
  } else {
    const prev = categoriesSet.get('noCategory')
    if (prev) {
      prev.count++
    }
  }

  // === 5. downloadDir 统计 ===
  if (t.save_path) {
    const prev = downloadDirSet.get(t.save_path)
    downloadDirSet.set(t.save_path, { count: (prev?.count || 0) + 1 })
  }

  // === 6. status 统计：只累加 count，元数据已在 initFilterOptions 预计算 ===
  for (let i = 0; i < qbStatusFilters.length; i++) {
    const filter = qbStatusFilters[i]
    if (filter.filter(t)) {
      const prev = statusSet.get(filter.key)
      if (prev) {
        prev.count++
      }
    }
  }
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

// 名称搜索：不区分大小写，并把点、空格、下划线和连字符当成同一种分隔符
export const normalizeSearchText = (value: string) => value.toLowerCase().replace(/[.\s_-]+/g, ' ').trim()

export const matchesTorrentSearch = (name: string, keyword: string) => {
  const query = normalizeSearchText(keyword)
  if (!query) {
    return true
  }
  return normalizeSearchText(name).includes(query)
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
  if (search.value && !matchesTorrentSearch(t.name, search.value)) {
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
// 种子数列展示的是「已连接 (群内总数)」。已连接经常全是 0，按它排序会退化成按名称。
// 排序以群内总数为主，已连接数相同总数时再比较。
const sortValue = (torrent: Torrent, key: string) => {
  if (key === 'num_seeds') {
    return torrent.num_complete ?? torrent.num_seeds ?? 0
  }
  if (key === 'num_leechs') {
    return torrent.num_incomplete ?? torrent.num_leechs ?? 0
  }
  return torrent[key as keyof Torrent]
}

export const sortTorrents = function (
  filtered: Torrent[],
  sortKey: globalThis.Ref<string, string>,
  sortOrder: globalThis.Ref<string, string>
) {
  filtered.sort((a, b) => {
    const aValue = sortValue(a, sortKey.value)
    const bValue = sortValue(b, sortKey.value)
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
    if (result === 0 && sortKey.value === 'num_seeds') {
      const aConnected = a.num_seeds || 0
      const bConnected = b.num_seeds || 0
      result = sortOrder.value === 'asc' ? aConnected - bConnected : bConnected - aConnected
    }
    if (result === 0 && sortKey.value === 'num_leechs') {
      const aConnected = a.num_leechs || 0
      const bConnected = b.num_leechs || 0
      result = sortOrder.value === 'asc' ? aConnected - bConnected : bConnected - aConnected
    }
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
