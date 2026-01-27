<template>
  <n-el class="torrent-detail" :style="detailStyle">
    <n-tabs
      v-model:value="activeTab"
      type="card"
      size="small"
      class="h-full flex flex-col"
      pane-class="flex-1 overflow-hidden p-0"
      tab-style="padding: 4px 12px;"
    >
      <n-tab-pane name="general" :tab="$t('torrentDetail.tabs.general')">
        <GeneralTab />
      </n-tab-pane>
      <n-tab-pane name="trackers" :tab="$t('torrentDetail.tabs.trackers')">
        <TrackersTab />
      </n-tab-pane>
      <n-tab-pane name="peers" :tab="$t('torrentDetail.tabs.peers')">
        <PeersTab />
      </n-tab-pane>
      <n-tab-pane name="httpSources" :tab="$t('torrentDetail.tabs.httpSources')">
        <HttpSourcesTab />
      </n-tab-pane>
      <n-tab-pane name="content" :tab="$t('torrentDetail.tabs.content')">
        <ContentTab />
      </n-tab-pane>
    </n-tabs>
  </n-el>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTorrentDetailStore } from '@/store/torrentDetail'

const props = defineProps<{
  height?: number
}>()

const detailStyle = computed(() => {
  return props.height ? { height: `${props.height}px` } : { height: '100%' }
})

const torrentDetailStore = useTorrentDetailStore()
const activeTab = computed({
  get: () => torrentDetailStore.activeDetailTab,
  set: (val) => {
    torrentDetailStore.activeDetailTab = val
  }
})
</script>

<style lang="less" scoped>
.torrent-detail {
  :deep(.n-tabs-pane-wrapper) {
    height: 100%;
    overflow: hidden;
  }
}
</style>
