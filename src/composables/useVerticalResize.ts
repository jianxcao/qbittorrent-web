import { usePointerDrag } from './usePointerDrag'

export function useVerticalResize(
  containerHeight: Ref<number>,
  minContainerHeight: number,
  maxContainerHeight: number
) {
  const startY = ref(0)
  const startHeight = ref(0)

  const { onPointerDown } = usePointerDrag({
    onStart(event) {
      startY.value = event.clientY
      startHeight.value = containerHeight.value ?? minContainerHeight
    },
    onMove(event) {
      const newHeight = Math.max(
        minContainerHeight,
        Math.min(maxContainerHeight, startHeight.value - (event.clientY - startY.value))
      )
      containerHeight.value = newHeight
    }
  })

  return {
    onResizePointerDown: onPointerDown
  }
}
