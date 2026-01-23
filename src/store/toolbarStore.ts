import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 工具栏状态管理
 * 用于管理选择模式等状态
 */
export const useToolbarStore = defineStore('canvasListToolbar', () => {
  const isMobile = useIsSmallScreen()
  const listType = ref(isMobile.value ? 'card' : 'table')
  function setListType(value: 'table' | 'card') {
    listType.value = value
  }
  function toggleListType() {
    listType.value = listType.value === 'table' ? 'card' : 'table'
  }
  // 是否显示选择模式（显示复选框列）
  const selectMode = ref(!isMobile.value)

  function setSelectMode(value: boolean) {
    selectMode.value = value
  }

  function toggleSelectMode() {
    selectMode.value = !selectMode.value
  }

  return {
    selectMode,
    setSelectMode,
    toggleSelectMode,
    listType,
    setListType,
    toggleListType
  }
})
