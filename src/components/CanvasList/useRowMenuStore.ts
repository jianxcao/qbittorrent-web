import { ref, computed } from 'vue'

/**
 * Row Menu Store
 * 管理行菜单的显示状态和选中的种子信息
 */

// 菜单显示状态
const showRowMenu = ref(false)

// 菜单位置
const menuX = ref(0)
const menuY = ref(0)

// 选中的种子 hash
const menuHash = ref('')

/**
 * 打开菜单
 */
export function openRowMenu(hash: string, x: number, y: number) {
  menuHash.value = hash
  menuX.value = x
  menuY.value = y
  showRowMenu.value = true
}

/**
 * 关闭菜单
 */
export function closeRowMenu() {
  showRowMenu.value = false
  // 延迟清空，避免关闭动画时数据消失
  setTimeout(() => {
    if (!showRowMenu.value) {
      menuHash.value = ''
      menuX.value = 0
      menuY.value = 0
    }
  }, 200)
}

/**
 * useRowMenuStore
 */
export function useRowMenuStore() {
  return {
    // 状态
    showRowMenu,
    menuX,
    menuY,
    menuHash,

    // 计算属性
    isMenuOpen: computed(() => showRowMenu.value),
    selectedHash: computed(() => menuHash.value),

    // 方法
    openMenu: openRowMenu,
    closeMenu: closeRowMenu
  }
}
