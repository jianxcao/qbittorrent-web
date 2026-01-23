import { ref, readonly, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { isSupportTouch } from '@/utils/evt'

export interface TouchScrollOptions {
  /**
   * 获取当前滚动位置
   */
  getScrollPosition: () => { scrollTop: number; scrollLeft: number }
  /**
   * 更新滚动位置
   * @param scrollTop 新的纵向滚动位置
   * @param scrollLeft 新的横向滚动位置
   */
  setScrollPosition: (scrollTop: number, scrollLeft: number) => void
  /**
   * 是否启用触摸滚动
   * @default true
   */
  enabled?: boolean
}

/**
 * 触摸滚动 composable
 * 用于处理移动端的触摸滚动事件
 */
export function useTouchScroll(
  target: Ref<HTMLElement | undefined>,
  options: TouchScrollOptions
) {
  const { getScrollPosition, setScrollPosition, enabled = true } = options

  // 触摸状态
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchStartScrollTop = ref(0)
  const touchStartScrollLeft = ref(0)
  const isTouching = ref(false)

  // 触摸开始处理
  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled || !isSupportTouch || e.touches.length !== 1) {
      return
    }

    isTouching.value = true
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY

    const { scrollTop, scrollLeft } = getScrollPosition()
    touchStartScrollTop.value = scrollTop
    touchStartScrollLeft.value = scrollLeft
  }

  // 触摸移动处理
  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled || !isTouching.value || e.touches.length !== 1) {
      return
    }

    e.preventDefault() // 防止页面滚动

    const deltaX = touchStartX.value - e.touches[0].clientX
    const deltaY = touchStartY.value - e.touches[0].clientY

    const newScrollTop = touchStartScrollTop.value + deltaY
    const newScrollLeft = touchStartScrollLeft.value + deltaX

    setScrollPosition(newScrollTop, newScrollLeft)
  }

  // 触摸结束处理
  const handleTouchEnd = () => {
    isTouching.value = false
  }

  // 注册事件监听器
  useEventListener(target, 'touchstart', handleTouchStart, { passive: false })
  useEventListener(target, 'touchmove', handleTouchMove, { passive: false })
  useEventListener(target, 'touchend', handleTouchEnd)
  useEventListener(target, 'touchcancel', handleTouchEnd)

  return {
    isTouching: readonly(isTouching)
  }
}
