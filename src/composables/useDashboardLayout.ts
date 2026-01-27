import { ref, computed, watchEffect, useTemplateRef } from 'vue'
import { useResizeObserver, } from '@vueuse/core'
import { useSettingStore } from '@/store'

/**
 * Dashboard 布局管理 Composable
 * 负责计算和管理 Dashboard 的高度和布局
 */
export function useDashboardLayout(isMobile: Ref<boolean>, pcDetailVisible: Ref<boolean>) {
  const settingStore = useSettingStore()

  // ==================== 状态 ====================
  const bodyHeight = ref(document.body.clientHeight || document.documentElement.clientHeight)
  const scrollContainer = ref<HTMLElement>(document.body)
  const detailContainerRef = useTemplateRef<HTMLElement>('detailContainerRef')

  // ==================== Computed ====================
  // 列表高度计算
  const listHeight = computed(() => {
    const detailHeight = !isMobile.value && pcDetailVisible.value ? settingStore.detailHeight : 0
    return bodyHeight.value - settingStore.headerHeight - settingStore.footerHeight - detailHeight
  })

  // ==================== 方法 ====================
  // 获取考虑安全区域的可用高度
  function getAvailableHeight() {
    const viewportHeight = window.innerHeight
    const safeAreaTop = settingStore.safeArea.top
    const safeAreaBottom = settingStore.safeArea.bottom
    return viewportHeight - safeAreaTop - safeAreaBottom
  }

  // 窗口大小改变处理
  function handleResize() {
    bodyHeight.value = getAvailableHeight()
  }

  // 初始化高度
  function initHeight() {
    bodyHeight.value = getAvailableHeight()

    // 设置事件监听器
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
  }

  // 清理事件监听
  function cleanupListeners() {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
  }

  // ==================== 监听器 ====================
  // 详情容器位置调整
  watchEffect(() => {
    if (detailContainerRef.value && pcDetailVisible.value) {
      detailContainerRef.value.style.transform = `translateY(${listHeight.value}px)`
    }
  })

  // 监听容器大小变化
  useResizeObserver(scrollContainer, () => {
    bodyHeight.value = getAvailableHeight()
  })

  return {
    bodyHeight,
    listHeight,
    detailContainerRef,
    initHeight,
    cleanupListeners
  }
}
