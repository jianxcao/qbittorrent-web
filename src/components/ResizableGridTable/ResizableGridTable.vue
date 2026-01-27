<template>
  <div class="resizable-grid-table h-full flex flex-col">
    <div ref="bodyRef" class="table-body">
      <div class="table-header" :style="{ gridTemplateColumns, minWidth: tableMinWidth + 'px' }">
        <div v-if="selectable" class="header-cell select-cell" @click.stop>
          <n-checkbox :checked="allSelected" @update:checked="toggleSelectAll" />
        </div>
        <div v-for="(column, index) in columns" :key="columnKey(column, index)" class="header-cell">
          <div class="header-content" :class="{ sortable: isSortable(column) }" @click="onHeaderClick(column)">
            <span class="header-title">{{ column.title }}</span>
            <span v-if="isSortable(column)" class="sort-indicator">{{ getSortIndicator(column) }}</span>
          </div>
          <ResizeLine
            v-if="isResizable(column) && index < columns.length - 1"
            :container-width="columnWidths[index]"
            :min-container-width="getMinWidth(column)"
            :max-container-width="maxColumnWidth"
            :lineWidth="3"
            class="column-resizer"
            @update:container-width="onColumnResize(column, index, $event)"
          />
        </div>
      </div>

      <div
        v-for="(row, rowIndex) in sortedData"
        :key="rowKeyValue(row, rowIndex)"
        class="table-row"
        :class="{ 'table-row-selected': isRowSelected(row, rowIndex) }"
        :style="{ gridTemplateColumns, minWidth: tableMinWidth + 'px' }"
        @click="onRowClick(row, rowIndex, $event)"
        @contextmenu.prevent="onRowContextMenu(row, $event)"
      >
        <div v-if="selectable" class="table-cell select-cell" @click.stop>
          <n-checkbox
            :checked="isRowSelected(row, rowIndex)"
            @update:checked="(checked) => toggleRow(row, rowIndex, checked)"
          />
        </div>
        <div
          v-for="(column, colIndex) in columns"
          :key="columnKey(column, colIndex)"
          class="table-cell"
          :class="[column.align ? 'align-' + column.align : '', isEllipsis(column) ? 'cell-ellipsis' : '']"
          :title="isTooltip(column) ? formatText(cellContent(column, row)) : ''"
        >
          <RenderCell :content="cellContent(column, row)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResizeLine from '@/components/ResizeLine.vue'
import type { ResizableGridColumn, SortState, SortOrder } from './types'

type RowData = Record<string, unknown>
type RowKey = string | number

const props = withDefaults(
  defineProps<{
    columns: ResizableGridColumn<any>[]
    data: any[]
    rowKey?: string | ((row: any, index: number) => string | number)
    selectable?: boolean
    selectOnRowClick?: boolean
    maxColumnWidth?: number
    minTableWidth?: number
    enableShiftSelect?: boolean
  }>(),
  {
    selectable: false,
    selectOnRowClick: true,
    maxColumnWidth: 0,
    enableShiftSelect: true
  }
)

const emit = defineEmits<{
  (e: 'row-contextmenu', row: any, event: MouseEvent): void
  (e: 'row-click', row: any, event?: MouseEvent): void
  (e: 'sort-change', state: SortState | null): void
}>()

const selectedKeys = defineModel<RowKey[]>('selectedKeys', { default: () => [] })
const lastSelectedIndex = ref<number | null>(null)

const bodyRef = ref<HTMLElement | null>(null)
const tableWidth = ref(0)

useResizeObserver(bodyRef, (entries) => {
  const entry = entries[0]
  if (!entry) {
    return
  }
  tableWidth.value = entry.contentRect.width
})

const columnWidths = ref<number[]>([])
const manualWidthKeys = ref<Set<string>>(new Set())

watch(
  () => [props.columns, tableWidth.value, props.minTableWidth] as const,
  ([cols, width, minTableWidth]) => {
    const minWidths = cols.map((column) => getMinWidth(column))
    const selectionWidth = props.selectable ? 40 : 0
    const effectiveWidth = minTableWidth && minTableWidth > 0 ? Math.max(width || 0, minTableWidth) : width || 0
    const availableWidth = Math.max(0, effectiveWidth - selectionWidth)

    const nextWidths: number[] = new Array(cols.length).fill(0)
    const pendingIndexes: number[] = []
    let fixedWidth = 0

    cols.forEach((column, index) => {
      const minWidth = minWidths[index]
      const currentWidth = columnWidths.value[index]
      const isManual = manualWidthKeys.value.has(getColumnId(column))
      if (typeof column.width === 'number') {
        const finalWidth = Math.max(minWidth, column.width)
        nextWidths[index] = finalWidth
        fixedWidth += finalWidth
        return
      }
      if (isManual && typeof currentWidth === 'number') {
        nextWidths[index] = Math.max(minWidth, currentWidth)
        fixedWidth += nextWidths[index]
        return
      }
      pendingIndexes.push(index)
    })

    const pendingCount = pendingIndexes.length
    const shareWidth = pendingCount > 0 ? (availableWidth - fixedWidth) / pendingCount : 0

    pendingIndexes.forEach((index) => {
      const minWidth = minWidths[index]
      const baseWidth = effectiveWidth ? Math.max(minWidth, shareWidth) : Math.max(minWidth, 160)
      nextWidths[index] = baseWidth
    })

    columnWidths.value = nextWidths
  },
  { immediate: true }
)

const gridTemplateColumns = computed(() => {
  const columns = columnWidths.value.map((width) => `${width}px`)
  if (props.selectable) {
    return `40px ${columns.join(' ')}`
  }
  return columns.join(' ')
})

const tableMinWidth = computed(() => {
  const selectionWidth = props.selectable ? 40 : 0
  const columnsWidth = columnWidths.value.reduce((total, width) => total + width, 0)
  const calculatedWidth = selectionWidth + columnsWidth

  if (props.minTableWidth && props.minTableWidth > 0) {
    return Math.max(calculatedWidth, props.minTableWidth)
  }

  return calculatedWidth
})

const maxColumnWidth = computed(() => {
  if (props.maxColumnWidth && props.maxColumnWidth > 0) {
    return props.maxColumnWidth
  }
  return Number.MAX_SAFE_INTEGER
})

const sortState = ref<SortState | null>(null)

const sortedData = computed(() => {
  if (!sortState.value) {
    return props.data
  }
  const { key, order } = sortState.value
  if (!order) {
    return props.data
  }
  const column = props.columns.find((col) => String(col.key) === key)
  if (!column || !column.sorter) {
    return props.data
  }
  const sorted = [...props.data]
  const direction = order === 'asc' ? 1 : -1
  const compare = getSorter(column)
  sorted.sort((row1, row2) => compare(row1, row2) * direction)
  return sorted
})

const RenderCell = defineComponent<{ content: unknown }>({
  props: {
    content: {
      type: null,
      default: null
    }
  },
  setup: (cellProps) => () => cellProps.content
})

function columnKey(column: ResizableGridColumn<RowData>, index: number) {
  return `${String(column.key)}-${index}`
}

function getColumnId(column: ResizableGridColumn<RowData>) {
  return String(column.key)
}

function onColumnResize(column: ResizableGridColumn<RowData>, index: number, value: number) {
  columnWidths.value[index] = value
  manualWidthKeys.value.add(getColumnId(column))
}

function rowKeyValue(row: RowData, index: number): RowKey {
  if (typeof props.rowKey === 'function') {
    return normalizeKey(props.rowKey(row, index), index)
  }
  if (typeof props.rowKey === 'string') {
    return normalizeKey(row[props.rowKey], index)
  }
  return index
}

function normalizeKey(value: unknown, fallback: number): RowKey {
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  if (value == null) {
    return fallback
  }
  return String(value)
}

function isSortable(column: ResizableGridColumn<RowData>) {
  return Boolean(column.sorter)
}

function isResizable(column: ResizableGridColumn<RowData>) {
  return column.resizable !== false
}

function getMinWidth(column: ResizableGridColumn<RowData>) {
  return column.minWidth ?? 60
}

function getSorter(column: ResizableGridColumn<RowData>) {
  if (column.sorter === 'default') {
    return (row1: RowData, row2: RowData) => {
      const value1 = row1[column.key as string]
      const value2 = row2[column.key as string]
      if (value1 == null && value2 == null) {
        return 0
      }
      if (value1 == null) {
        return -1
      }
      if (value2 == null) {
        return 1
      }
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        return value1 - value2
      }
      return String(value1).localeCompare(String(value2))
    }
  }
  if (typeof column.sorter === 'function') {
    return column.sorter
  }
  return () => 0
}

function onHeaderClick(column: ResizableGridColumn<RowData>) {
  if (!isSortable(column)) {
    return
  }
  const key = String(column.key)
  const nextOrder = getNextOrder(sortState.value, key)
  sortState.value = nextOrder ? { key, order: nextOrder } : null
  emit('sort-change', sortState.value)
}

function getNextOrder(current: SortState | null, key: string): SortOrder {
  if (!current || current.key !== key) {
    return 'asc'
  }
  if (current.order === 'asc') {
    return 'desc'
  }
  return null
}

function getSortIndicator(column: ResizableGridColumn<RowData>) {
  if (!sortState.value || sortState.value.key !== String(column.key)) {
    return '⇅'
  }
  return sortState.value.order === 'asc' ? '↑' : '↓'
}

function cellContent(column: ResizableGridColumn<RowData>, row: RowData) {
  if (column.render) {
    return column.render(row)
  }
  return row[column.key as string] ?? ''
}

function isEllipsis(column: ResizableGridColumn<RowData>) {
  return Boolean(column.ellipsis)
}

function isTooltip(column: ResizableGridColumn<RowData>) {
  if (column.ellipsis === true) {
    return true
  }
  if (typeof column.ellipsis === 'object' && column.ellipsis) {
    return Boolean(column.ellipsis.tooltip)
  }
  return false
}

function formatText(value: unknown) {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

const allSelected = computed(() => {
  if (!props.selectable || props.data.length === 0) {
    return false
  }
  return props.data.every((row, index) => selectedKeys.value.includes(rowKeyValue(row, index)))
})

function toggleSelectAll(checked: boolean) {
  if (!props.selectable) {
    return
  }
  if (checked) {
    selectedKeys.value = props.data.map((row, index) => rowKeyValue(row, index))
  } else {
    selectedKeys.value = []
  }
}

function isRowSelected(row: RowData, index: number) {
  return selectedKeys.value.includes(rowKeyValue(row, index))
}

function toggleRow(row: RowData, index: number, checked?: boolean) {
  const key = rowKeyValue(row, index)
  const nextKeys = new Set(selectedKeys.value)

  if (checked !== undefined) {
    // 来自 checkbox 的明确状态
    if (checked) {
      nextKeys.add(key)
    } else {
      nextKeys.delete(key)
    }
  } else {
    // 切换模式（用于点击事件）
    if (nextKeys.has(key)) {
      nextKeys.delete(key)
    } else {
      nextKeys.add(key)
    }
  }

  selectedKeys.value = Array.from(nextKeys)
}

function onRowClick(row: RowData, index: number, event: MouseEvent) {
  emit('row-click', row)
  if (props.selectable && props.selectOnRowClick) {
    if (props.enableShiftSelect && event.shiftKey && lastSelectedIndex.value !== null) {
      selectRange(lastSelectedIndex.value, index)
    } else {
      toggleRow(row, index)
      lastSelectedIndex.value = index
    }
  }
}

function onRowContextMenu(row: RowData, event: MouseEvent) {
  emit('row-contextmenu', row, event)
}

function selectRange(startIndex: number, endIndex: number) {
  const start = Math.min(startIndex, endIndex)
  const end = Math.max(startIndex, endIndex)
  const nextKeys = new Set(selectedKeys.value)
  for (let i = start; i <= end; i += 1) {
    const row = sortedData.value[i]
    if (row) {
      nextKeys.add(rowKeyValue(row, i))
    }
  }
  selectedKeys.value = Array.from(nextKeys)
  lastSelectedIndex.value = endIndex
}
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';
.resizable-grid-table {
  min-height: 0;
  color: var(--text-color-2);
  user-select: none;
}

.table-header {
  display: grid;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--table-color);
  border-bottom: 1px solid var(--border-color);
  min-height: 28px;
}

.header-cell {
  position: relative;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
  display: flex;
  align-items: center;
  min-width: 0;
  background-color: var(--table-header-color);
  border-right: 1px solid var(--border-color);
}

.header-cell:last-child {
  border-right: none;
}

.header-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: default;
}

.header-content.sortable {
  cursor: pointer;
}

.header-title {
  min-width: 0;
}

.sort-indicator {
  font-size: 12px;
  color: var(--text-color-3);
}

.column-resizer {
  position: absolute;
  right: -2px;
  top: 0;
  height: 100%;
}

.table-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  .scrollbar();
}

.table-row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  min-height: 28px;
  &:nth-child(odd) {
    background-color: color-mix(in srgb, var(--table-color-striped) 50%, transparent);
  }
}

.table-row:hover {
  background-color: var(--table-color-hover);
}

.table-row-selected {
  background-color: color-mix(in srgb, var(--primary-color) 50%, transparent) !important;
}

.table-cell {
  padding: 4px 8px;
  min-width: 0;
}

.cell-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.align-right {
  text-align: right;
}

.align-center {
  text-align: center;
}

.select-cell {
  padding-left: 6px;
  padding-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
