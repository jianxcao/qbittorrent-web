import type { Torrent as BaseTorrent, Category, TransferInfo } from '@/api/types'
import { getMainData } from '@/api/modules/sync'
import { getCategories, getTags } from '@/api/modules/torrents'
import { useColumns } from '@/composables/useColumns'
import { useSelection } from '@/composables/useSelection'
import { useSettingStore } from '@/store/setting'
import { useIntervalFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  detailFilterOptions,
  isFilterTorrents,
  mapToOptions,
  processTorrent,
  sortTorrents,
  type IMenuItem,
  type Torrent
} from './torrentUtils'

export const useTorrentStore = defineStore('torrent', () => {
  const settingStore = useSettingStore()

  // 同步相关状态
  const rid = ref<number>(0) // 主数据同步 ID

  // 数据状态
  const torrentsMap = ref<Record<string, Torrent>>({}) // 使用 Map 结构存储，便于增量更新
  const torrents = ref<Torrent[]>([]) // 数组形式，用于展示
  const usedCategories = ref<Record<string, Category>>({}) // 分类
  const allCategories = ref<Record<string, Category>>({}) // 所有分类
  const usedTags = ref<string[]>([]) // 标签
  const allTags = ref<string[]>([]) // 所有标签
  const serverState = ref<Partial<TransferInfo>>({}) // 全局传输状态
  // 排序相关
  const sortKey = ref<string>('id') // 默认按添加时间排序
  const sortOrder = ref<'asc' | 'desc'>('desc') // 默认降序
  function setSort(key: string) {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'desc' // 新字段默认降序
    }
  }

  // 搜索关键字
  const search = ref('')

  // 过滤条件（单选）
  const statusFilter = ref<string>('all')
  const tagsFilter = ref<string>('all')
  const trackerFilter = ref<string>('all')
  const errorStringFilter = ref<string>('all')
  const downloadDirFilter = ref<string>('all')
  const categoryFilter = ref<string>('all')

  // 列显示相关逻辑抽离
  const {
    columns,
    setVisibleColumns,
    updateColumnWidth,
    toggleColumnVisible,
    moveColumn,
    visibleColumns,
    tableMinWidth,
    mapColumnWidth,
    getColumnTitle
  } = useColumns()

  // 真正的一次循环计算所有数据
  const computedData = computed(() => {
    // 初始化统计集合
    const tagsSet = new Map<string, IMenuItem>()
    tagsSet.set('noTags', { count: 0, label: '无标签' })
    const trackerSet = new Map<string, IMenuItem>()
    const errorStringSet = new Map<string, IMenuItem>()
    const downloadDirSet = new Map<string, IMenuItem>()
    const statusSet = new Map<string, IMenuItem>()
    const categoriesSet = new Map<string, IMenuItem>()
    categoriesSet.set('noCategory', { count: 0, label: '无分类' })

    // 存储过滤后的结果
    const filtered: Torrent[] = []
    //  生成索引映射（使用 hash 作为 key）
    const mapFilterTorrentsIndex: Record<string, number> = {}
    const mapTorrentsHash: Record<string, Torrent> = {}

    // 一次循环完成所有计算：统计 + 过滤
    let filteredIndex = 0
    torrents.value.forEach((t) => {
      mapTorrentsHash[t.hash] = t
      // 将选项全部放到 map 中
      detailFilterOptions(
        t,
        tagsSet,
        trackerSet,
        errorStringSet,
        downloadDirSet,
        statusSet,
        categoriesSet,
        allTags.value,
        allCategories.value
      )
      // 如果通过所有过滤条件，加入结果数组
      if (
        isFilterTorrents(
          t,
          search,
          statusFilter,
          tagsFilter,
          trackerFilter,
          errorStringFilter,
          downloadDirFilter,
          categoryFilter
        )
      ) {
        filtered.push(t)
        mapFilterTorrentsIndex[t.hash] = filteredIndex++
      }
    })

    // === 3. 排序（只对过滤后的数据进行排序） ===
    if (sortKey.value) {
      sortTorrents(filtered, sortKey, sortOrder)
    }
    // 检测所有的 filter 的值是否在 map 里面，如果不在重置成全部
    if (!statusSet.get(statusFilter.value)) {
      statusFilter.value = 'all'
    }
    if (!tagsSet.get(tagsFilter.value) && tagsFilter.value !== 'all') {
      tagsFilter.value = 'all'
    }
    if (!trackerSet.get(trackerFilter.value)) {
      trackerFilter.value = 'all'
    }
    if (!errorStringSet.get(errorStringFilter.value)) {
      errorStringFilter.value = 'all'
    }
    if (!downloadDirSet.get(downloadDirFilter.value)) {
      downloadDirFilter.value = 'all'
    }
    if (!categoriesSet.get(categoryFilter.value) && categoryFilter.value !== 'all') {
      categoryFilter.value = 'all'
    }
    const options = {
      tagsOptions: mapToOptions(tagsSet, torrents.value.length),
      trackerOptions: mapToOptions(trackerSet, torrents.value.length),
      errorStringOptions: mapToOptions(errorStringSet, torrents.value.length),
      downloadDirOptions: mapToOptions(downloadDirSet, torrents.value.length),
      statusOptions: mapToOptions(statusSet, torrents.value.length),
      categoryOptions: mapToOptions(categoriesSet, torrents.value.length)
    }
    return {
      options,
      filterTorrents: filtered,
      mapFilterTorrentsIndex,
      mapTorrentsHash: mapTorrentsHash
    }
  })

  // 从合并的 computed 中提取各个部分
  const options = computed(() => computedData.value.options)
  const filterTorrents = computed(() => computedData.value.filterTorrents)
  const mapFilterTorrentsIndex = computed(() => computedData.value.mapFilterTorrentsIndex)

  // selection 相关逻辑拆分
  const {
    mapSelectedKeys,
    selectedKeys,
    setSelectedKeys,
    toggleSelectedKey,
    clearSelectedKeys,
    selectRange,
    lastSelectedHash,
    setLastSelectedHash
  } = useSelection(() => filterTorrents.value)

  async function fetchTorrents() {
    // 首次加载获取所有分类和标签
    if (rid.value === 0) {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([getCategories(), getTags()])
        allCategories.value = categoriesRes
        allTags.value = tagsRes
      } catch (e) {
        console.error('Failed to fetch initial categories/tags:', e)
      }
    }

    const res = await getMainData(rid.value)

    // 更新同步 ID
    rid.value = res.rid

    // 批量更新标志 - 关键优化点
    let needsUpdate = false

    // 处理完整更新
    if (res.full_update) {
      const newMap: Record<string, Torrent> = {}
      if (res.torrents) {
        // 批量处理,一次性创建新对象
        for (const [hash, data] of Object.entries(res.torrents)) {
          newMap[hash] = processTorrent({ ...data, hash } as Torrent)
        }
      }
      // 一次性替换整个 map,只触发一次响应式更新
      torrentsMap.value = newMap
      needsUpdate = true
    } else {
      // 增量更新优化:先在普通对象上操作,最后批量提交
      const currentMap = torrentsMap.value
      const updates: Record<string, Torrent> = {}
      const deletions: string[] = []

      // 收集更新
      if (res.torrents) {
        for (const [hash, data] of Object.entries(res.torrents)) {
          const existing = currentMap[hash]
          if (existing) {
            // 增量合并:只更新变化的字段,避免完整 processTorrent
            updates[hash] = { ...existing, ...data } as Torrent
            // 只在必要时重新计算 derived 字段
            if (data.tags !== undefined && data.tags !== existing.tags) {
              const tagsArray = data.tags
                ? data.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t)
                : []
              updates[hash].tagsArray = tagsArray
            }
            if (data.tracker !== undefined && data.tracker !== existing.tracker) {
              let trackerHost = ''
              if (data.tracker) {
                try {
                  trackerHost = new URL(data.tracker).hostname
                } catch {
                  trackerHost = data.tracker
                }
              }
              updates[hash].trackerHost = trackerHost
            }
            if (data.save_path !== undefined && data.save_path !== existing.save_path) {
              updates[hash].save_path = (data.save_path as string).replace(/\\/g, '/')
            }
          } else {
            // 新增的 torrent,完整处理
            updates[hash] = processTorrent({ ...data, hash } as Torrent)
          }
        }
      }

      // 收集删除
      if (res.torrents_removed) {
        deletions.push(...res.torrents_removed)
      }

      // 批量提交更新(如果有变化)
      if (Object.keys(updates).length > 0 || deletions.length > 0) {
        // 创建新对象,避免直接修改响应式对象
        const newMap = { ...currentMap }

        // 应用更新
        Object.assign(newMap, updates)

        // 应用删除
        for (const hash of deletions) {
          delete newMap[hash]
        }

        // 一次性更新,只触发一次响应式
        torrentsMap.value = newMap
        needsUpdate = true
      }
    }

    // 只在 map 有变化时才更新数组
    if (needsUpdate) {
      // 优化:复用数组,减少 GC 压力
      torrents.value = Object.values(torrentsMap.value)
    }

    // 更新 categories - 批量优化
    if (res.categories || res.categories_removed) {
      const newCategories = { ...usedCategories.value }
      const newAllCategories = { ...allCategories.value }

      if (res.categories) {
        Object.assign(newCategories, res.categories)
        Object.assign(newAllCategories, res.categories)
      }

      if (res.categories_removed) {
        for (const cat of res.categories_removed) {
          delete newCategories[cat]
          delete newAllCategories[cat]
        }
      }

      usedCategories.value = newCategories
      allCategories.value = newAllCategories
    }

    // 更新 tags - 优化过滤逻辑
    if (res.tags || res.tags_removed) {
      const newTags = new Set(usedTags.value)
      const newAllTags = new Set(allTags.value)

      if (res.tags) {
        res.tags.forEach((tag) => {
          newTags.add(tag)
          newAllTags.add(tag)
        })
      }

      if (res.tags_removed) {
        res.tags_removed.forEach((tag) => {
          newTags.delete(tag)
          newAllTags.delete(tag)
        })
      }

      usedTags.value = Array.from(newTags)
      allTags.value = Array.from(newAllTags)
    }

    // 更新 server_state
    if (res.server_state) {
      serverState.value = { ...serverState.value, ...res.server_state }
    }
  }


  const interval = computed(() => settingStore.setting.polling.torrentInterval * 1000)
  const { pause: stopPolling, resume: startPolling } = useIntervalFn(fetchTorrents, interval, { immediate: false })

  watch([search, statusFilter, tagsFilter, trackerFilter, errorStringFilter, downloadDirFilter, categoryFilter], () => {
    clearSelectedKeys()
  })
    ; (window as any).torrents = torrents
  return {
    getColumnTitle,
    torrents,
    filterTorrents,
    mapFilterTorrentsIndex,
    statusFilter,
    tagsFilter,
    trackerFilter,
    errorStringFilter,
    downloadDirFilter,
    categoryFilter,
    search,
    tagsOptions: computed(() => options.value.tagsOptions),
    trackerOptions: computed(() => options.value.trackerOptions),
    errorStringOptions: computed(() => options.value.errorStringOptions),
    downloadDirOptions: computed(() => options.value.downloadDirOptions),
    statusOptions: computed(() => options.value.statusOptions),
    categoryOptions: computed(() => options.value.categoryOptions),
    fetchTorrents,
    mapSelectedKeys,
    selectedKeys,
    setSelectedKeys,
    toggleSelectedKey,
    clearSelectedKeys,
    selectRange,
    lastSelectedHash,
    setLastSelectedHash,
    startPolling,
    stopPolling,
    columns,
    setVisibleColumns,
    updateColumnWidth,
    toggleColumnVisible,
    moveColumn,
    visibleColumns,
    tableMinWidth,
    sortKey,
    sortOrder,
    setSort,
    mapColumnWidth,
    // 状态
    usedCategories,
    usedTags,
    allCategories,
    allTags,
    serverState,
    rid,
    torrentsMap
  }
})
