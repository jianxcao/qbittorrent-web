<template>
  <div>
    <div ref="containerRef" class="canvas-list-body" @contextmenu.prevent="onContextMenu"></div>
    <RowMenu
      v-model:show="rowMenuStore.showRowMenu.value"
      :x="rowMenuStore.menuX.value"
      :y="rowMenuStore.menuY.value"
      :hash="rowMenuStore.menuHash.value"
    />
  </div>
</template>

<script setup lang="ts">
import { Leafer, Rect, Group } from 'leafer-ui'
import { useTorrentStore, useSettingStore } from '@/store'
import { useToolbarStore } from '@/store/toolbarStore'
import { useRowMenuStore } from './useRowMenuStore'
import { getCellRenderer } from './renderers'
import type { CellRenderContext } from './types'
import { onKeyStroke, useElementSize } from '@vueuse/core'
import { isMac } from '@/utils'
import RowMenu from './RowMenu.vue'
import { BUFFER_SIZE, CHECKBOX_WIDTH, ROW_HEIGHT } from './constant'

const props = defineProps<{
  listHeight: number
  scrollTop: number
  scrollLeft: number
}>()

const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const toolbarStore = useToolbarStore()
const rowMenuStore = useRowMenuStore()
const containerRef = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(containerRef)

function onContextMenu(e: MouseEvent) {
  if (!containerRef.value) {
    return
  }

  const rect = containerRef.value.getBoundingClientRect()
  const relativeY = e.clientY - rect.top
  const absoluteY = relativeY + props.scrollTop
  const rowIndex = Math.floor(absoluteY / ROW_HEIGHT)

  const torrents = torrentStore.filterTorrents
  if (rowIndex >= 0 && rowIndex < torrents.length) {
    const torrent = torrents[rowIndex]
    rowMenuStore.openMenu(torrent.hash, e.clientX, e.clientY)

    // Right click selection logic
    if (!torrentStore.selectedKeys.includes(torrent.hash)) {
      torrentStore.setSelectedKeys([torrent.hash])
      torrentStore.setLastSelectedIndex(rowIndex)
    }
  }
}

// LeaferJS 实例
let leafer: Leafer | null = null
let scrollGroup: Group | null = null
let stickyGroup: Group | null = null

// Hover 状态
const hoverRowIndex = ref<number | null>(null)

// 计算可见区域
const visibleRange = computed(() => {
  const total = torrentStore.filterTorrents.length
  const startIndex = Math.max(0, Math.floor(props.scrollTop / ROW_HEIGHT) - BUFFER_SIZE)
  const visibleCount = Math.ceil(props.listHeight / ROW_HEIGHT)
  const endIndex = Math.min(total - 1, startIndex + visibleCount + 2 * BUFFER_SIZE)

  return { startIndex, endIndex, total }
})

// 监听数据变化，触发重绘
// 使用 requestAnimationFrame 控制渲染频率，与浏览器刷新率同步
let renderScheduled = false
let renderFrameId: number | null = null

function scheduleRender() {
  if (!renderScheduled) {
    renderScheduled = true
    renderFrameId = requestAnimationFrame(() => {
      renderVisibleRows()
      renderScheduled = false
      renderFrameId = null
    })
  }
}

// 取消已调度的渲染
function cancelScheduledRender() {
  if (renderFrameId !== null) {
    cancelAnimationFrame(renderFrameId)
    renderFrameId = null
    renderScheduled = false
  }
}

watch(
  () => [
    torrentStore.filterTorrents,
    torrentStore.selectedKeys,
    torrentStore.visibleColumns,
    settingStore.themeVars,
    visibleRange.value,
    hoverRowIndex.value,
    toolbarStore.selectMode
  ],
  () => {
    scheduleRender()
  },
  { deep: true }
)

function getRowBgColors(params: { isSelected: boolean; isHover: boolean; isEven: boolean; theme: any }) {
  const { isSelected, isHover, isEven, theme } = params

  // scroll 区域保持原逻辑：选中/条纹使用半透明叠加
  let scrollBgColor: string | undefined = undefined
  if (isSelected) {
    scrollBgColor = `color-mix(in srgb, ${theme.primaryColor} 50%, transparent)`
  } else if (isHover) {
    scrollBgColor = theme.tableColorHover
  } else if (isEven) {
    scrollBgColor = `color-mix(in srgb, ${theme.tableColorStriped} 50%, transparent)`
  }

  // let stickyBgColor: string = theme.tableColor
  // if (isSelected) {
  //   stickyBgColor = theme.tableColor
  // } else if (isHover) {
  //   stickyBgColor = theme.tableColorHover
  // } else if (isEven) {
  //   stickyBgColor = theme.tableColorStriped
  // }
  return { scrollBgColor, stickyBgColor: scrollBgColor }
}

function attachRowEvents(rowGroup: Group, rowIndex: number) {
  rowGroup.on('tap', (e: any) => {
    handleRowClick(rowIndex, e)
  })
  rowGroup.on('pointer.enter', () => {
    hoverRowIndex.value = rowIndex
  })
  rowGroup.on('pointer.leave', () => {
    if (hoverRowIndex.value === rowIndex) {
      hoverRowIndex.value = null
    }
  })
}

function renderStickyRowGroup(params: {
  rowIndex: number
  rowY: number
  torrent: any
  isSelected: boolean
  bgColor?: string
  theme: any
}) {
  if (!stickyGroup) {
    return
  }

  const { rowIndex, rowY, torrent, isSelected, bgColor, theme } = params
  const rowGroup = new Group()
  const bg = new Rect({
    x: 0,
    y: rowY,
    width: CHECKBOX_WIDTH,
    height: ROW_HEIGHT,
    fill: theme.tableColor,
    hitFill: 'all'
  })
  rowGroup.add(bg)
  const stickyBg = new Rect({
    x: 0,
    y: rowY,
    width: CHECKBOX_WIDTH,
    height: ROW_HEIGHT,
    fill: bgColor,
    hitFill: 'all'
  })
  rowGroup.add(stickyBg)

  const stickyBorderLine = new Rect({
    x: 0,
    y: rowY + ROW_HEIGHT - 1,
    width: CHECKBOX_WIDTH,
    height: 1,
    fill: theme.borderColor
  })
  rowGroup.add(stickyBorderLine)

  try {
    const checkboxCtx: CellRenderContext = {
      value: isSelected,
      row: torrent,
      columnKey: 'checkbox',
      x: 0,
      y: rowY,
      width: CHECKBOX_WIDTH,
      height: ROW_HEIGHT,
      isSelected,
      theme
    }

    const checkboxRenderer = getCellRenderer('checkbox')
    checkboxRenderer.render(checkboxCtx, rowGroup)
  } catch (error) {
    console.error('Error rendering checkbox:', error)
  }

  attachRowEvents(rowGroup, rowIndex)
  stickyGroup.add(rowGroup)
}

function renderRowGroup(params: {
  rowIndex: number
  rowY: number
  xStart: number
  width: number
  torrent: any
  columns: any[]
  isSelected: boolean
  bgColor?: string
  theme: any
}) {
  const { rowIndex, rowY, xStart, width, torrent, columns, isSelected, bgColor, theme } = params

  const rowGroup = new Group()

  const rowBg = new Rect({
    x: xStart,
    y: rowY,
    width: Math.max(0, width),
    height: ROW_HEIGHT,
    fill: bgColor,
    hitFill: 'all'
  })
  rowGroup.add(rowBg)

  const borderLine = new Rect({
    x: xStart,
    y: rowY + ROW_HEIGHT - 1,
    width: Math.max(0, width),
    height: 1,
    fill: theme.borderColor
  })
  rowGroup.add(borderLine)

  // 渲染数据列（从 xStart 开始）
  let currentX = xStart
  for (const column of columns) {
    const cellValue = (torrent as any)[column.key]
    const cellWidth = column.width

    const ctx: CellRenderContext = {
      value: cellValue,
      row: torrent,
      columnKey: column.key,
      x: currentX,
      y: rowY,
      width: cellWidth,
      height: ROW_HEIGHT,
      isSelected,
      theme
    }

    const renderer = getCellRenderer(column.key)
    renderer.render(ctx, rowGroup)
    currentX += cellWidth
  }

  attachRowEvents(rowGroup, rowIndex)
  return rowGroup
}

// 渲染可见行
function renderVisibleRows() {
  if (!scrollGroup) {
    return
  }

  // 清空现有内容
  scrollGroup.clear()
  stickyGroup?.clear()

  const { startIndex, endIndex } = visibleRange.value
  const torrents = torrentStore.filterTorrents
  const columns = torrentStore.visibleColumns
  const theme = settingStore.themeVars
  const selectedKeysSet = new Set(torrentStore.selectedKeys)

  // 渲染每一行
  for (let i = startIndex; i <= endIndex; i++) {
    if (i >= torrents.length) {
      break
    }

    const torrent = torrents[i]
    const isSelected = selectedKeysSet.has(torrent.hash)
    const isHover = hoverRowIndex.value === i
    const rowY = i * ROW_HEIGHT

    // 绘制行背景 - 优先级：选中 > Hover > 单双行变色
    const isEven = i % 2 === 0
    const { scrollBgColor, stickyBgColor } = getRowBgColors({ isSelected, isHover, isEven, theme })

    // 计算行总宽度（包含 checkbox 列）
    const rowTotalWidth = toolbarStore.selectMode
      ? torrentStore.tableMinWidth + CHECKBOX_WIDTH
      : torrentStore.tableMinWidth

    // 选择模式开启：checkbox 首列需要“固定”，因此拆分为 stickyGroup + scrollGroup 两层渲染
    if (toolbarStore.selectMode) {
      renderStickyRowGroup({
        rowIndex: i,
        rowY,
        torrent,
        isSelected,
        bgColor: stickyBgColor,
        theme
      })

      const scrollRowGroup = renderRowGroup({
        rowIndex: i,
        rowY,
        xStart: CHECKBOX_WIDTH,
        width: rowTotalWidth - CHECKBOX_WIDTH,
        torrent,
        columns,
        isSelected,
        bgColor: scrollBgColor,
        theme
      })
      scrollGroup.add(scrollRowGroup)
    } else {
      // 非选择模式：直接渲染为单层（随 scrollLeft 平移）
      const rowGroup = renderRowGroup({
        rowIndex: i,
        rowY,
        xStart: 0,
        width: rowTotalWidth,
        torrent,
        columns,
        isSelected,
        bgColor: scrollBgColor,
        theme
      })
      scrollGroup.add(rowGroup)
    }
  }
}

// 处理行点击事件
// 添加节流保护，防止重渲染过程中丢失点击
let isHandlingClick = false
function handleRowClick(rowIndex: number, e: any) {
  // 防止重复处理
  if (isHandlingClick) {
    return
  }

  const torrents = torrentStore.filterTorrents
  if (rowIndex < 0 || rowIndex >= torrents.length) {
    return
  }

  isHandlingClick = true

  try {
    const torrent = torrents[rowIndex]

    // 检查是否点击了 checkbox 列（使用相对于内容的坐标）
    // const clickX = (e.x || 0) + props.scrollLeft
    // const isCheckboxClick = toolbarStore.selectMode && clickX < CHECKBOX_WIDTH
    // 点击其他区域：原有逻辑
    // Shift 键范围选择
    if (e.shiftKey) {
      torrentStore.selectRange(rowIndex)
    } else {
      torrentStore.toggleSelectedKey(torrent.hash)
      torrentStore.setLastSelectedIndex(rowIndex)
    }
  } finally {
    // 使用 requestAnimationFrame 确保渲染完成后才允许下次点击
    requestAnimationFrame(() => {
      isHandlingClick = false
    })
  }
}

// 监听滚动位置变化，更新 contentGroup 偏移
watch([() => props.scrollTop, () => props.scrollLeft], () => {
  if (scrollGroup) {
    scrollGroup.y = -props.scrollTop
    scrollGroup.x = -props.scrollLeft
  }
  if (stickyGroup) {
    stickyGroup.y = -props.scrollTop
    stickyGroup.x = 0
  }
})

// 监听 listHeight 变化，更新 Leafer 高度
watch(
  () => props.listHeight,
  (newHeight) => {
    if (leafer) {
      leafer.height = newHeight
    }
  }
)

// 监听容器尺寸变化，更新 Leafer 宽度
watch(containerWidth, (width) => {
  if (leafer && width > 0) {
    leafer.width = width
  }
})

// 初始化 LeaferJS
onMounted(() => {
  if (!containerRef.value) {
    return
  }

  // 创建 Leafer 实例
  leafer = new Leafer({
    view: containerRef.value,
    width: containerWidth.value,
    height: props.listHeight
  })

  // 创建滚动内容组（随 scrollLeft 平移）
  scrollGroup = new Group()
  leafer.add(scrollGroup)

  // 创建固定列内容组（仅随 scrollTop 平移，不随 scrollLeft 平移）
  stickyGroup = new Group()
  leafer.add(stickyGroup)

  // 首次渲染
  renderVisibleRows()
})

// 监听 Ctrl+A / Cmd+A 全选快捷键
onKeyStroke(
  (e) => {
    // Mac 使用 Cmd，其他系统使用 Ctrl
    const isModifierPressed = isMac() ? e.metaKey : e.ctrlKey
    return isModifierPressed && e.key === 'a'
  },
  (e) => {
    // 检查是否在输入框或文本区域中，如果是则不处理
    const activeElement = document.activeElement
    const isInputFocused =
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable))

    // 如果不在输入框中，则处理全选
    if (!isInputFocused) {
      e.preventDefault()
      // 选择所有过滤后的种子
      const allHashes = torrentStore.filterTorrents.map((t) => t.hash)
      torrentStore.setSelectedKeys(allHashes)
    }
  }
)

// 清理资源
onUnmounted(() => {
  // 取消待执行的渲染
  cancelScheduledRender()

  if (leafer) {
    leafer.destroy()
    leafer = null
  }
  scrollGroup = null
  stickyGroup = null
})
</script>

<style lang="less">
.canvas-list-body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: auto;
}
</style>
