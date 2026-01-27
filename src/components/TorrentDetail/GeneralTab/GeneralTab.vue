<template>
  <div class="general-tab h-full overflow-y-auto p-4">
    <div v-if="properties">
      <!-- 进度条 -->
      <div v-if="currentTorrent" class="progress-section">
        <n-progress type="line" :percentage="progressPercentage" />
      </div>

      <!-- 传输信息 -->
      <TransferInfo :properties="properties" />

      <!-- 种子信息 -->
      <TorrentInfo :properties="properties" :hash="torrentStore.selectedKeys[0]" />
    </div>
    <div v-else class="flex justify-center items-center h-full text-gray-400">
      {{ $t('torrentDetail.general.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTorrentStore } from '@/store/torrent'
import { useTorrentDetailStore } from '@/store/torrentDetail'
import { computed } from 'vue'
import TransferInfo from './TransferInfo.vue'
import TorrentInfo from './TorrentInfo.vue'

const torrentStore = useTorrentStore()
const torrentDetailStore = useTorrentDetailStore()
const properties = computed(() => torrentDetailStore.currentProperties)

const currentTorrent = computed(() => {
  const hash = torrentStore.selectedKeys[0]
  return hash ? torrentStore.torrentsMap[hash] : null
})

const progressPercentage = computed(() => {
  return currentTorrent.value ? currentTorrent.value.progress * 100 : 0
})
</script>

<style scoped>
.general-tab {
  background-color: var(--n-color);
}

.progress-section {
  margin-bottom: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}
</style>
