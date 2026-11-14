import { usePointerDrag } from './usePointerDrag'

export function useResize(containerWidth: Ref<number>, minContainerWidth: number, maxContainerWidth: number) {
  const startX = ref(0)
  const startWidth = ref(0)

  const { onPointerDown } = usePointerDrag({
    onStart(event) {
      startX.value = event.clientX
      startWidth.value = containerWidth.value ?? minContainerWidth
    },
    onMove(event) {
      const newWidth = Math.max(minContainerWidth, Math.min(maxContainerWidth, startWidth.value + event.clientX - startX.value))
      containerWidth.value = newWidth
    }
  })

  return {
    onResizePointerDown: onPointerDown
  }
}
