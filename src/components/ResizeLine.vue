<template>
  <div
    class="resizer-line"
    @pointerdown="onResizePointerDown"
    :style="{ width: lineWidth + 'px' }"
  ></div>
</template>

<script setup lang="ts">
import { useResize } from '@/composables/useResize'

const props = withDefaults(
  defineProps<{
    lineWidth?: number
    maxContainerWidth: number
    minContainerWidth: number
  }>(),
  {
    lineWidth: 6
  }
)
const containerWidth = defineModel<number>('containerWidth', { required: true })
const { onResizePointerDown } = useResize(
  containerWidth,
  props.minContainerWidth,
  props.maxContainerWidth
)
</script>

<style lang="less" scoped>
.resizer-line {
  width: 6px;
  cursor: ew-resize;
  touch-action: none;
  background-color: var(--border-color);
  transition: background 0.2s;
  height: 100%;
  z-index: 10;
  &:hover,
  &.active {
    background-color: var(--primary-color);
  }
}
</style>
