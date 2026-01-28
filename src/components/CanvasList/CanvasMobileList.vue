<template>
  <div class="canvas-mobile-list" :style="{ height: props.listHeight + 'px' }">
    <ToolbarView />
    <div ref="scrollWrapperRef" class="scroll-wrapper" @scroll="handleScroll">
      <div class="scroll-spacer" :style="{ height: spacerHeight + 'px' }"></div>
      <div ref="containerRef" class="canvas-mobile-body"></div>
    </div>
    <RowMenu
      v-model:show="rowMenuStore.showRowMenu.value"
      :x="rowMenuStore.menuX.value"
      :y="rowMenuStore.menuY.value"
      :hash="rowMenuStore.menuHash.value"
    />
  </div>
</template>

<script setup lang="ts">
import { useSettingStore, useTorrentStore } from '@/store'
import { useToolbarStore } from '@/store/toolbarStore'
import { useElementSize } from '@vueuse/core'
import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
import { Group, Leafer, Rect } from 'leafer-ui'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import RowMenu from './RowMenu.vue'
import ToolbarView from './ToolbarView.vue'
import { mobileCellRenderers } from './mobileCells'
import { useRowMenuStore } from './useRowMenuStore'

// 扩展 colord 支持混合功能
extend([mixPlugin])

import { BUFFER_SIZE, TOOLBAR_HEIGHT } from './constant'
import {
  MOBILE_CARD_HEIGHT,
  MOBILE_CARD_MARGIN,
  MOBILE_CARD_PADDING,
  MOBILE_CARD_RADIUS,
  MOBILE_CARD_TOTAL_HEIGHT,
  MOBILE_CELL_SPACING
} from './mobileConstants'

const props = defineProps<{
  listHeight: number
}>()

const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const toolbarStore = useToolbarStore()
const rowMenuStore = useRowMenuStore()
const containerRef = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(containerRef)

// 获取实际容器宽度，如果 useElementSize 返回 0 则使用 DOM 直接获取
const actualWidth = computed(() => {
  if (containerWidth.value > 0) {
    return containerWidth.value
  }
  return containerRef.value?.clientWidth || window.innerWidth
})

// Scroll state
const scrollTop = ref(0)

// LeaferJS 实例
let leafer: Leafer | null = null
let contentGroup: Group | null = null

// Hover 状态
const hoverRowIndex = ref<number | null>(null)

// 计算 spacer 高度（虚拟滚动总高度）
const spacerHeight = computed(() => {
  return torrentStore.filterTorrents.length * MOBILE_CARD_TOTAL_HEIGHT
})

// 计算可见区域
const visibleRange = computed(() => {
  const total = torrentStore.filterTorrents.length
  const startIndex = Math.max(0, Math.floor(scrollTop.value / MOBILE_CARD_TOTAL_HEIGHT) - BUFFER_SIZE)
  const visibleCount = Math.ceil(props.listHeight / MOBILE_CARD_TOTAL_HEIGHT)
  const endIndex = Math.min(total - 1, startIndex + visibleCount + 2 * BUFFER_SIZE)

  return { startIndex, endIndex, total }
})

// 处理滚动事件
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
}

/**
 * 获取卡片样式（根据状态）
 */
function getCardStyle(isSelected: boolean, isHover: boolean) {
  const theme = settingStore.themeVars

  let bgColor = theme.cardColor
  let borderColor = theme.borderColor
  let borderWidth = 1

  if (isSelected) {
    // bgColor = `color-mix(in srgb, ${theme.primaryColor} 10%, ${theme.cardColor})`
    // borderColor = theme.primaryColor
    bgColor = colord(theme.primaryColor).mix(theme.cardColor, 0.1).alpha(0.05).toRgbString()
    borderColor = theme.primaryColor
    borderWidth = 2
  } else if (isHover) {
    bgColor = theme.tableColorHover
  }

  return { bgColor, borderColor, borderWidth }
}

/**
 * 渲染单个卡片
 */
function renderCard(torrent: any, index: number, y: number) {
  if (!contentGroup) {
    return
  }

  const cardGroup = new Group()
  const theme = settingStore.themeVars
  const isSelected = torrentStore.selectedKeys.includes(torrent.hash)
  const isHover = hoverRowIndex.value === index

  const cardWidth = actualWidth.value - MOBILE_CARD_MARGIN * 2
  const { bgColor, borderColor, borderWidth } = getCardStyle(isSelected, isHover)

  // 1. 绘制卡片背景
  const cardBg = new Rect({
    x: MOBILE_CARD_MARGIN,
    y: y,
    width: cardWidth,
    height: MOBILE_CARD_HEIGHT,
    fill: bgColor,
    stroke: borderColor,
    strokeWidth: borderWidth,
    cornerRadius: MOBILE_CARD_RADIUS,
    hitFill: 'all'
  })
  cardGroup.add(cardBg)

  // 2. 渲染5个Cell（按顺序）
  let cellY = y + MOBILE_CARD_PADDING
  const cellWidth = cardWidth - MOBILE_CARD_PADDING * 2

  for (const renderer of mobileCellRenderers) {
    const cellHeight = renderer.calculateHeight({
      row: torrent,
      x: MOBILE_CARD_MARGIN + MOBILE_CARD_PADDING,
      width: cellWidth,
      isSelected,
      theme
    })

    renderer.render(
      {
        row: torrent,
        x: MOBILE_CARD_MARGIN + MOBILE_CARD_PADDING,
        y: cellY,
        width: cellWidth,
        height: cellHeight - MOBILE_CELL_SPACING,
        isSelected,
        theme
      },
      cardGroup
    )

    cellY += cellHeight
  }

  // 3. 绑定事件
  cardGroup.on('tap', (e: any) => {
    // 或者检查父节点是否是菜单按钮
    let parent = e.target
    while (parent) {
      if (parent.name === 'menuButton') {
        handleMenuButtonClick(torrent.hash, e)
        return
      }
      parent = parent.parent
    }
    // 普通卡片点击
    setTimeout(() => {
      handleCardClick(index, e)
    }, 100)
  })

  cardGroup.on('pointer.enter', () => {
    hoverRowIndex.value = index
  })

  cardGroup.on('pointer.leave', () => {
    if (hoverRowIndex.value === index) {
      hoverRowIndex.value = null
    }
  })

  contentGroup.add(cardGroup)
}

/**
 * 处理菜单按钮点击事件
 */
function handleMenuButtonClick(hash: string, e: any) {
  if (!containerRef.value) {
    return
  }

  // 获取点击位置
  const clickX = e.x || 0
  const clickY = e.y || 0

  // 计算屏幕坐标
  const rect = containerRef.value.getBoundingClientRect()
  const screenX = rect.left + clickX
  const screenY = rect.top + clickY

  // 打开菜单
  rowMenuStore.openMenu(hash, screenX, screenY)
}

/**
 * 处理卡片点击事件
 */
function handleCardClick(rowIndex: number, e: any) {
  const torrents = torrentStore.filterTorrents
  if (rowIndex < 0 || rowIndex >= torrents.length) {
    return
  }
  const torrent = torrents[rowIndex]
  // 普通点击：选中/取消选中
  if (e.shiftKey) {
    torrentStore.selectRange(rowIndex)
  } else {
    torrentStore.toggleSelectedKey(torrent.hash)
    torrentStore.setLastSelectedHash(torrent.hash)
  }
}

/**
 * 渲染可见卡片
 */
let renderScheduled = false
let renderFrameId: number | null = null

function scheduleRender() {
  if (!renderScheduled) {
    renderScheduled = true
    renderFrameId = requestAnimationFrame(() => {
      renderVisibleCards()
      renderScheduled = false
      renderFrameId = null
    })
  }
}

function cancelScheduledRender() {
  if (renderFrameId !== null) {
    cancelAnimationFrame(renderFrameId)
    renderFrameId = null
    renderScheduled = false
  }
}

function renderVisibleCards() {
  if (!contentGroup) {
    return
  }

  // 清空现有内容
  contentGroup.clear()

  const { startIndex, endIndex } = visibleRange.value
  const torrents = torrentStore.filterTorrents

  // 渲染每个可见卡片
  for (let i = startIndex; i <= endIndex; i++) {
    if (i >= torrents.length) {
      break
    }

    const torrent = torrents[i]
    const cardY = i * MOBILE_CARD_TOTAL_HEIGHT + MOBILE_CARD_MARGIN

    renderCard(torrent, i, cardY)
  }
}

// 监听数据变化，触发重绘
watch(
  () => [
    torrentStore.filterTorrents,
    torrentStore.selectedKeys,
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

// 监听滚动位置变化，更新 contentGroup 偏移
watch(scrollTop, () => {
  if (contentGroup) {
    contentGroup.y = -scrollTop.value
  }
})

// 监听容器尺寸变化，更新 Leafer 宽度
watch(actualWidth, (width) => {
  if (leafer && width > 0) {
    leafer.width = width
  }
})

// 监听 listHeight 变化，更新 Leafer 高度
watch(
  () => props.listHeight,
  (newHeight) => {
    if (leafer) {
      leafer.height = newHeight - TOOLBAR_HEIGHT
    }
  }
)

// 初始化 LeaferJS
onMounted(() => {
  nextTick(() => {
    if (!containerRef.value) {
      return
    }

    // 创建 Leafer 实例，使用 actualWidth 确保获取到正确的宽度
    leafer = new Leafer({
      view: containerRef.value,
      width: actualWidth.value,
      height: props.listHeight - TOOLBAR_HEIGHT,
      mobile: true
    })

    // 创建内容组（随滚动平移）
    contentGroup = new Group()
    leafer.add(contentGroup)

    // 首次渲染
    renderVisibleCards()
  })
})

// 清理资源
onUnmounted(() => {
  cancelScheduledRender()

  if (leafer) {
    leafer.destroy()
    leafer = null
  }
  contentGroup = null
})
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';

.canvas-mobile-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.scroll-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  .scrollbar();
}

.scroll-spacer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: -1;
}

.canvas-mobile-body {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
  overflow: hidden;
}
</style>
