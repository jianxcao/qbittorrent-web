export interface PointerDragHandlers {
  /** 按下时回调，用于记录起始位置/尺寸等起始状态 */
  onStart?: (event: PointerEvent, target: HTMLElement) => void
  /** 拖动中回调 */
  onMove: (event: PointerEvent) => void
  /** 抬起/取消时回调 */
  onEnd?: (event: PointerEvent) => void
}

/**
 * 统一的 pointer 拖动处理。
 * 只响应鼠标左键，或触摸/笔输入，触屏设备上的鼠标事件不再被提前丢弃。
 * 按下时捕获指针并挂上 move/up/cancel 监听，抬起时统一收尾。
 */
export function usePointerDrag(handlers: PointerDragHandlers) {
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') {
      return
    }
    const target = e.currentTarget as HTMLElement
    e.preventDefault()
    target.classList.add('active')
    // 指针捕获失败（例如没有活动的指针）不应中断拖动，捕获只是让移出元素后仍能收到 move。
    try {
      target.setPointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }

    function onMove(event: PointerEvent) {
      handlers.onMove(event)
    }
    function onUp(event: PointerEvent) {
      cleanup()
      handlers.onEnd?.(event)
    }
    function cleanup() {
      target.classList.remove('active')
      try {
        target.releasePointerCapture?.(e.pointerId)
      } catch {
        /* ignore */
      }
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      target.removeEventListener('pointercancel', onUp)
    }

    handlers.onStart?.(e, target)
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
    target.addEventListener('pointercancel', onUp)
  }

  return {
    onPointerDown
  }
}
