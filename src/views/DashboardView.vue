<template>
  <n-spin v-if="loading" :show="loading" size="large" class="min-h-screen min-w-screen" />
  <div v-else class="dashboard-grid" :style="{ gridTemplateColumns: gridLayout }">
    <!-- Header -->
    <n-layout-header class="header" bordered>
      <n-button quaternary circle @click="handleSidebarToggle">
        <n-icon size="20" :component="LayoutSidebarLeftOpen" />
      </n-button>
      <AppHeader @layout-bottom="handleLayoutBottom" />
    </n-layout-header>

    <!-- Sidebar (PC) 可拖拽宽度 -->
    <div v-if="!isMobile" class="sidebar-container">
      <SidebarView class="sidebar" />
      <ResizeLine
        v-model:container-width="settingStore.sidebarWidth"
        :min-container-width="120"
        :max-container-width="600"
      />
    </div>

    <!-- Main Content -->
    <main class="content">
      <CanvasList v-if="!isMobile || toolbarStore.listType === 'table'" :list-height="listHeight" />
      <CanvasMobileList v-else :list-height="listHeight" />
      <div v-if="!isMobile" ref="detailContainerRef" class="detail-container">
        <template v-if="pcDetailVisible">
          <ResizeHorizontalLine
            v-model:container-height="settingStore.detailHeight"
            :min-container-height="120"
            :max-container-height="600"
          />
          <TorrentDetail :height="settingStore.detailHeight" :loading="loadingDetail" />
        </template>
      </div>
    </main>

    <!-- Footer -->
    <StatusBar class="footer" />

    <!-- 移动端抽屉 -->
    <template v-if="isMobile">
      <MobileSidebarDrawer v-model:visible="mobileSidebarVisible" />
      <MobileDetailDrawer v-model:visible="mobileDetailVisible" @close="handleCloseDetail" :loading="loadingDetail" />
    </template>
  </div>
</template>

<script setup lang="ts">
// ==================== 导入 ====================
// 1. Vue 生态系统
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. 第三方库
import { useLocalStorage } from '@vueuse/core'

// 3. 本地导入
import LayoutSidebarLeftOpen from '@/assets/icons/layoutSidebarLeft.svg?component'
import { useDashboardLayout } from '@/composables/useDashboardLayout'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useSettingStore, useTorrentDetailStore, useTorrentStore } from '@/store'
import { useSessionStore } from '@/store/session'
import { useToolbarStore } from '@/store/toolbarStore'

// ==================== Store 和 Router ====================
const router = useRouter()
const torrentStore = useTorrentStore()
const torrentDetailStore = useTorrentDetailStore()
const sessionStore = useSessionStore()
const settingStore = useSettingStore()
const toolbarStore = useToolbarStore()

// ==================== 响应式状态 ====================
const loading = ref(true)
const loadingDetail = ref(false)

// 持久化状态
const isMobile = useIsSmallScreen()
const sidebarVisible = useLocalStorage<boolean>('sidebarVisible', true)
const pcDetailVisible = useLocalStorage<boolean>('pcDetailVisible', !isMobile.value)

// 布局管理
const { listHeight, detailContainerRef, initHeight, cleanupListeners } = useDashboardLayout(isMobile, pcDetailVisible)

// 移动端抽屉状态
const mobileSidebarVisible = ref(false)
const mobileDetailVisible = computed({
  get: () => isMobile.value && !toolbarStore.selectMode && torrentStore.selectedKeys.length > 0,
  set: (val: boolean) => {
    if (!val) {
      torrentStore.clearSelectedKeys()
    }
  }
})

// ==================== Computed 属性 ====================
// Grid 布局计算
const gridLayout = computed(() => {
  if (isMobile.value || !sidebarVisible.value) {
    return '0px 1fr'
  }
  return `${settingStore.sidebarWidth}px 1fr`
})

// ==================== 方法 ====================

// 侧边栏切换
function handleSidebarToggle() {
  if (isMobile.value) {
    mobileSidebarVisible.value = !mobileSidebarVisible.value
  } else {
    sidebarVisible.value = !sidebarVisible.value
  }
}

// 关闭详情面板
function handleCloseDetail() {
  torrentStore.clearSelectedKeys()
}

// 切换底部详情面板
function handleLayoutBottom() {
  if (isMobile.value) {
    pcDetailVisible.value = false
  } else {
    pcDetailVisible.value = !pcDetailVisible.value
  }
}

// 详情面板数据加载和轮询
watch([pcDetailVisible, mobileDetailVisible, () => torrentStore.selectedKeys], () => {
  if (pcDetailVisible.value || mobileDetailVisible.value) {
    loadingDetail.value = true
    torrentDetailStore.fetchDetails().finally(() => {
      loadingDetail.value = false
    })
    torrentDetailStore.startDetailPolling()
  } else {
    torrentDetailStore.stopDetailPolling()
  }
})

watchEffect(() => {
  console.debug('toolbarStore.listType', mobileDetailVisible.value)
})

// ==================== 生命周期 ====================
onMounted(async () => {
  loading.value = true

  // 初始化布局
  initHeight()

  try {
    await sessionStore.fetchVersion()
    await torrentStore.fetchTorrents()
    settingStore.fetchPreferences()
    loading.value = false
  } catch (error) {
    console.error('DashboardView onMounted error', error)
    loading.value = false
    router.push('/login')
  }
})

onUnmounted(() => {
  torrentStore.stopPolling()
  cleanupListeners()
})
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';

.dashboard-grid {
  display: grid;
  grid-template-rows: 56px 1fr 32px;
  box-sizing: border-box;
  height: 100%;

  .header {
    grid-row: 1 / 2;
    grid-column: 1 / -1;
    height: 56px;
    z-index: 10;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    overflow: hidden;
  }
}

.sidebar-container {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  height: 100%;
  position: relative;
  z-index: 2;
  background-color: var(--card-color);
  color: var(--text-color-2);
  overflow: hidden;
  display: flex;
  flex-direction: row;

  .sidebar {
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    // 美化滚动条
    .scrollbar();
  }
}

.content {
  grid-row: 2 / 3;
  grid-column: 2 / 3;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.footer {
  grid-row: 3 / 4;
  grid-column: 1 / -1;
  height: 32px;
  z-index: 10;
  display: flex;
  align-items: center;
}

.detail-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
</style>
