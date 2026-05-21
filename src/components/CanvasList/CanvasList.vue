<template>
  <div class="canvas-list" :style="{ height: props.listHeight + 'px' }">
    <ToolbarView v-if="isMobile" />
    <ListHeader
      :show-header-menu="showHeaderMenu"
      :is-sticky-select-all="true"
      :scroll-left="scrollLeft"
      @update:show-header-menu="showHeaderMenu = $event"
    />
    <div ref="scrollWrapperRef" class="scroll-wrapper" @scroll="handleScroll">
      <div class="scroll-spacer" :style="{ width: contentWidth + 'px', height: spacerHeight + 'px' }"></div>
      <CanvasListBody
        class="canvas-body-fixed"
        :style="{ height: bodyHeight + 'px' }"
        :list-height="bodyHeight"
        :scroll-top="scrollTop"
        :scroll-left="scrollLeft"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import ListHeader from './ListHeader.vue'
import CanvasListBody from './CanvasListBody.vue'
import { useTorrentStore } from '@/store'
import { useToolbarStore } from '@/store/toolbarStore'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { CHECKBOX_WIDTH, ROW_HEIGHT, TOOLBAR_HEIGHT } from './constant'
import ToolbarView from './ToolbarView.vue'
const props = defineProps<{
  listHeight: number
}>()

const torrentStore = useTorrentStore()
const toolbarStore = useToolbarStore()
const isMobile = useIsSmallScreen()
const showHeaderMenu = ref(false)
const headerHeight = ref(0)
const scrollWrapperRef = ref<HTMLElement>()
const scrollLeft = ref(0)
const scrollTop = ref(0)

// 计算 body 的实际高度（总高度 - header 高度）
const bodyHeight = computed(() => {
  return isMobile.value ? props.listHeight - headerHeight.value - TOOLBAR_HEIGHT : props.listHeight - headerHeight.value
})

// spacer 高度 = torrents 数量 * ROW_HEIGHT
const spacerHeight = computed(() => {
  return torrentStore.filterTorrents.length * ROW_HEIGHT
})

// 内容总宽度（包含 checkbox 列）
const contentWidth = computed(() => {
  return toolbarStore.selectMode ? torrentStore.tableMinWidth + CHECKBOX_WIDTH : torrentStore.tableMinWidth
})

// 处理滚动事件
function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  scrollTop.value = target.scrollTop
  scrollLeft.value = target.scrollLeft
}

function scrollToTorrentIfNeeded(hash: string | null) {
  if (!hash || !scrollWrapperRef.value) {
    return
  }

  const rowIndex = torrentStore.mapFilterTorrentsIndex[hash]
  if (rowIndex === undefined) {
    return
  }

  const rowTop = rowIndex * ROW_HEIGHT
  const rowBottom = rowTop + ROW_HEIGHT
  const scrollWrapper = scrollWrapperRef.value
  const visibleTop = scrollWrapper.scrollTop
  const visibleBottom = visibleTop + scrollWrapper.clientHeight

  if (rowTop >= visibleTop && rowBottom <= visibleBottom) {
    return
  }

  scrollWrapper.scrollTop = Math.max(0, rowTop)
  scrollTop.value = scrollWrapper.scrollTop
}

watch(
  () => torrentStore.scrollToTorrentRequest,
  () => {
    nextTick(() => {
      scrollToTorrentIfNeeded(torrentStore.scrollToTorrentHash)
    })
  }
)

// 获取 header 的实际高度
onMounted(() => {
  nextTick(() => {
    const el = document.querySelector('.torrent-table-header')
    if (el) {
      headerHeight.value = el.getBoundingClientRect().height
    }
    torrentStore.startPolling()
  })
})
onUnmounted(() => {
  torrentStore.stopPolling()
})
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';
.canvas-list {
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
  /* 用于撑起滚动容器的高度和宽度 */
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: -1;
}

.canvas-body-fixed {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: auto;
  overflow: hidden;
}
</style>
