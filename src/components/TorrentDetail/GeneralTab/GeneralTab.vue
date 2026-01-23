<template>
  <div class="general-tab h-full overflow-y-auto p-4">
    <div v-if="properties">
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
</script>

<style scoped>
.general-tab {
  background-color: var(--n-color);
}
</style>
