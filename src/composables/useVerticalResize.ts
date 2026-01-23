import { isSupportTouch } from '@/utils/evt'

export function useVerticalResize(
  containerHeight: Ref<number>,
  minContainerHeight: number,
  maxContainerHeight: number
) {
  function handleResizeStart(
    startY: number,
    getCurrentY: (e: any) => number,
    moveEvent: string,
    upEvent: string,
    target?: HTMLElement
  ) {
    const startHeight = containerHeight.value ?? minContainerHeight
    if (target) {
      target.classList.add('active')
    }
    function onMove(e: any) {
      const currentY = getCurrentY(e)
      const delta = currentY - startY
      const newHeight = Math.max(minContainerHeight, Math.min(maxContainerHeight, startHeight - delta))
      containerHeight.value = newHeight
    }
    function onUp() {
      target?.classList.remove('active')
      window.removeEventListener(moveEvent, onMove)
      window.removeEventListener(upEvent, onUp)
    }
    window.addEventListener(upEvent, onUp)
    window.addEventListener(moveEvent, onMove)
  }

  function onResizeMouseDown(e: MouseEvent) {
    if (isSupportTouch) {
      return
    }
    const dom = e.target as HTMLElement
    handleResizeStart(e.clientY, (evt) => evt.clientY, 'mousemove', 'mouseup', dom)
  }

  function onResizeTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      return
    }
    const dom = e.target as HTMLElement
    e.preventDefault()
    handleResizeStart(e.touches[0].clientY, (evt) => evt.touches[0].clientY, 'touchmove', 'touchend', dom)
  }

  return {
    onResizeMouseDown,
    onResizeTouchStart
  }
}
