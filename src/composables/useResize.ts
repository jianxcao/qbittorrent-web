import { isSupportTouch } from '@/utils/evt'

export function useResize(containerWidth: Ref<number>, minContainerWidth: number, maxContainerWidth: number) {
  function handleResizeStart(startX: number, getCurrentX: (e: any) => number, moveEvent: string, upEvent: string) {
    const startWidth = containerWidth.value ?? minContainerWidth
    function onMove(e: any) {
      const currentX = getCurrentX(e)
      const newWidth = Math.max(minContainerWidth, Math.min(maxContainerWidth, startWidth + currentX - startX))
      containerWidth.value = newWidth
    }
    function onUp(e: any) {
      const dom = e.target as HTMLElement
      dom.classList.remove('active')
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
    handleResizeStart(e.clientX, (evt) => evt.clientX, 'mousemove', 'mouseup')
  }

  function onResizeTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) {
      return
    }
    const dom = e.target as HTMLElement
    dom.classList.add('active')
    e.preventDefault()
    handleResizeStart(e.touches[0].clientX, (evt) => evt.touches[0].clientX, 'touchmove', 'touchend')
  }
  return {
    onResizeMouseDown,
    onResizeTouchStart
  }
}
