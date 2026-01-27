<template>
  <div class="trackers-tab h-full flex flex-col">
    <ResizableGridTable
      v-model:selected-keys="selectedTrackerKeys"
      :columns="trackerColumns"
      :data="trackers"
      row-key="url"
      selectable
      class="flex-1"
      :min-table-width="1000"
      @row-contextmenu="onRowContextMenu"
    />
    <TrackerContextMenu ref="contextMenuRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTorrentDetailStore } from '@/store/torrentDetail'
import ResizableGridTable from '@/components/ResizableGridTable/ResizableGridTable.vue'
import TrackerContextMenu from './TrackerContextMenu.vue'
import { useTrackerColumns } from './columns'
import type { Tracker } from '@/api/types'

const { trackerColumns } = useTrackerColumns()
const torrentDetailStore = useTorrentDetailStore()
const trackers = computed(() => torrentDetailStore.currentTrackers)

const contextMenuRef = ref<InstanceType<typeof TrackerContextMenu>>()
const selectedTrackerKeys = computed({
  get: () => contextMenuRef.value?.selectedTrackerKeys ?? [],
  set: (val) => {
    if (contextMenuRef.value) {
      contextMenuRef.value.selectedTrackerKeys = val
    }
  }
})

function onRowContextMenu(row: Tracker, event: MouseEvent) {
  contextMenuRef.value?.onRowContextMenu(row, event)
}
</script>
