<template>
  <div class="resizer-horizontal" @mousedown="onResizeMouseDown" @touchstart="onResizeTouchStart"></div>
</template>

<script setup lang="ts">
import { useVerticalResize } from '@/composables/useVerticalResize'

const props = withDefaults(
  defineProps<{
    minContainerHeight: number
    maxContainerHeight: number
  }>(),
  {}
)

const containerHeight = defineModel<number>('containerHeight', { required: true })
const { onResizeMouseDown, onResizeTouchStart } = useVerticalResize(
  containerHeight,
  props.minContainerHeight,
  props.maxContainerHeight
)
</script>

<style scoped lang="less">
.resizer-horizontal {
  height: 6px;
  cursor: ns-resize;
  background-color: var(--border-color);
  transition: background 0.2s;
  width: 100%;
  z-index: 10;
}
.resizer-horizontal:hover,
.resizer-horizontal.active {
  background-color: var(--primary-color);
}
</style>
