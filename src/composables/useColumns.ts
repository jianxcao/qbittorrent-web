import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

export interface ColumnConfig {
  key: string
  width: number
  visible: boolean
}

export const allColumns = [
  // 使用 qBittorrent 原始字段名，参考官方 dynamicTable.js
  { key: 'priority', minWidth: 40 }, // 优先级 #
  { key: 'name', fixed: true, minWidth: 350 }, // 名称（包含状态图标）
  { key: 'size', minWidth: 90 }, // 大小（size字段）
  { key: 'total_size', minWidth: 90 }, // 总大小
  { key: 'progress', minWidth: 120 }, // 进度
  { key: 'state', minWidth: 100 }, // 状态
  { key: 'num_seeds', minWidth: 95 }, // 种子数
  { key: 'num_leechs', minWidth: 80 }, // 用户数
  { key: 'dlspeed', minWidth: 115 }, // 下载速度
  { key: 'upspeed', minWidth: 100 }, // 上传速度
  { key: 'eta', minWidth: 100 }, // 剩余时间
  { key: 'ratio', minWidth: 80 }, // 比率
  { key: 'popularity', minWidth: 90 }, // 流行度（API中没有此字段，需要后端支持或使用其他字段）
  { key: 'category', minWidth: 120 }, // 分类
  { key: 'tags', minWidth: 150 }, // 标签
  { key: 'added_on', minWidth: 190 }, // 添加时间
  { key: 'completion_on', minWidth: 190 }, // 完成时间
  { key: 'tracker', minWidth: 150 }, // Tracker
  { key: 'dl_limit', minWidth: 100 }, // 下载限制
  { key: 'up_limit', minWidth: 100 }, // 上传限制
  { key: 'downloaded', minWidth: 100 }, // 已下载
  { key: 'uploaded', minWidth: 100 }, // 已上传
  { key: 'downloaded_session', minWidth: 120 }, // 本次会话已下载
  { key: 'uploaded_session', minWidth: 120 }, // 本次会话已上传
  { key: 'amount_left', minWidth: 100 }, // 剩余
  { key: 'time_active', minWidth: 120 }, // 活动时间
  { key: 'completed', minWidth: 100 }, // 已完成
  { key: 'save_path', minWidth: 200 }, // 保存路径
  { key: 'max_ratio', minWidth: 100 }, // 分享率限制
  { key: 'seen_complete', minWidth: 150 }, // 上次完整可见
  { key: 'last_activity', minWidth: 120 }, // 最后活动
  { key: 'reannounce', minWidth: 100 }, // 重新汇报
  { key: 'content_path', minWidth: 200 }, // 内容路径
  { key: 'availability', minWidth: 90 } // 可用性
]

export const defaultVisibleColumns = [
  'name',
  'size',
  'total_size',
  'progress',
  'state',
  'num_seeds',
  'num_leechs',
  'num_seeds',
  'num_leechs',
  'dlspeed',
  'upspeed',
  'eta',
  'ratio',
  'popularity',
  'category',
  'tags',
  'added_on',
  'completion_on',
  'tracker',
  'save_path'
]

export function useColumns(storageKey = 'torrent-columns') {
  const { t } = useI18n()

  // 获取当前所有有效的列 key
  const validColumnKeys = new Set(allColumns.map((col) => col.key))

  // 初始化 visibleColumns
  const columns = useStorage<ColumnConfig[]>(
    storageKey,
    allColumns.map((col) => {
      const isDefaultVisible = defaultVisibleColumns.includes(col.key)
      return {
        key: col.key,
        width: col.minWidth,
        visible: col.key === 'name' ? true : isDefaultVisible
      }
    })
  )

  // 同步列配置：确保包含所有 allColumns 中的列
  // 1. 保留已保存的有效列配置
  // 2. 添加新增的列（用户之前配置中不存在的）
  const existingColumnKeys = new Set(columns.value.map((col) => col.key))
  const validExistingColumns = columns.value.filter((col) => validColumnKeys.has(col.key))

  // 查找新增的列（在 allColumns 中但不在已保存配置中）
  const newColumns = allColumns
    .filter((col) => !existingColumnKeys.has(col.key))
    .map((col) => {
      const isDefaultVisible = defaultVisibleColumns.includes(col.key)
      return {
        key: col.key,
        width: col.minWidth,
        visible: col.key === 'name' ? true : isDefaultVisible
      }
    })

  // 合并：保持已有列的顺序，新列添加到末尾
  columns.value = [...validExistingColumns, ...newColumns]

  // name 列默认显示
  function setVisibleColumns(cols: ColumnConfig[]) {
    columns.value = cols.map((col) => (col.key === 'name' ? { ...col, visible: true } : col))
  }

  function updateColumnWidth(key: string, width: number) {
    columns.value = columns.value.map((col) => (col.key === key ? { ...col, width } : col))
  }

  function toggleColumnVisible(key: string) {
    if (key === 'name') {
      return
    }
    columns.value = columns.value.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col))
  }

  function moveColumn(from: number, to: number) {
    const arr = [...columns.value]
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    columns.value = arr
  }

  // 获取列的国际化标题
  function getColumnTitle(key: string): string {
    return t(`columns.${key}`)
  }

  const visibleColumns = computed(() => columns.value.filter((col) => col.visible))
  const tableMinWidth = computed(() => visibleColumns.value.reduce((sum, col) => sum + (col.width || 150), 0))
  const mapColumnWidth = computed(() => {
    return visibleColumns.value.reduce(
      (acc, col) => {
        acc[col.key] = col.width
        return acc
      },
      {} as Record<string, number>
    )
  })
  return {
    columns,
    setVisibleColumns,
    updateColumnWidth,
    toggleColumnVisible,
    moveColumn,
    getColumnTitle,
    visibleColumns,
    tableMinWidth,
    mapColumnWidth
  }
}
