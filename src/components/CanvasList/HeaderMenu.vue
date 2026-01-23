<template>
  <n-popover
    :show="props.show"
    :show-arrow="false"
    :scrollable="false"
    trigger="manual"
    placement="bottom-start"
    :x="props.x"
    :y="props.y"
    :width="180"
    @update:show="(val) => emit('update:show', val)"
    class="p-0!"
    :animated="false"
  >
    <n-el class="overflow-y-auto h-full column-selector-popover-content">
      <draggable :list="columns" @update:list="onDragEnd" item-key="key" :handle="'.drag-icon'">
        <template #item="{ element: col }">
          <div
            :key="col.key"
            class="column-selector-item"
            :class="{ disabled: col.key === 'name' }"
            @click="toggle(col.key)"
          >
            <span class="checkmark-icon">
              <n-icon v-if="isChecked(col.key)" size="12" :class="{ 'icon-disabled': col.key === 'name' }">
                <CheckmarkOutline />
              </n-icon>
            </span>
            <span class="column-title">{{ getTitle(col.key) }}</span>
            <n-icon size="16" class="drag-icon cursor-move" :component="DragIcon" />
          </div>
        </template>
      </draggable>
    </n-el>
  </n-popover>
</template>
<script setup lang="ts">
import { CheckmarkOutline } from '@vicons/ionicons5'
import draggable from 'vuedraggable'
import { useTorrentStore } from '@/store'
import DragIcon from '@/assets/icons/drag.svg?component'
import { isSupportTouch } from '@/utils/evt'

const props = defineProps<{
  show: boolean
  x: number
  y: number
}>()
const emit = defineEmits(['update:show'])

const torrentStore = useTorrentStore()
const { getColumnTitle } = torrentStore
const columns = computed(() => torrentStore.columns)
const checked = computed(() => columns.value.filter((c) => c.visible).map((c) => c.key))
function isChecked(key: string) {
  return checked.value.includes(key)
}
function toggle(key: string) {
  if (key === 'name') {
    return
  } // 禁止操作 name 列
  torrentStore.toggleColumnVisible(key)
}
function onDragEnd(newList: { key: string; width: number; visible: boolean }[]) {
  torrentStore.setVisibleColumns(newList)
}
function getTitle(key: string) {
  return getColumnTitle(key)
}
const close = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.closest('.column-selector-item') || target.closest('.column-selector-popover-content')) {
    return
  }
  emit('update:show', false)
}
useEventListener(document, 'mousedown', close)
if (isSupportTouch) {
  useEventListener(document, 'touchstart', close)
}

onKeyStroke('Escape', () => {
  emit('update:show', false)
})
</script>
<style lang="less" scoped>
@import '@/styles/mix.less';

.column-selector-popover-content {
  max-height: 70vh;
  box-sizing: border-box;
  padding: 6px;
  .scrollbar();
}

.column-selector-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  user-select: none;
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */

  &:hover {
    background: var(--table-color-hover, #232323);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.checkmark-icon {
  width: 20px;
  display: inline-block;
  text-align: center;
}

.icon-disabled {
  color: #aaa !important;
}

.column-title {
  flex: 1;
}
</style>
