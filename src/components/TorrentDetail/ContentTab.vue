<template>
  <div class="content-tab h-full flex flex-col">
    <TorrentFileTreeTable
      :files="files"
      :hash="hash"
      class="flex-1"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TorrentFileTreeTable from '@/components/TorrentFileTreeTable/TorrentFileTreeTable.vue'
import { useTorrentDetailStore } from '@/store/torrentDetail'

const torrentDetailStore = useTorrentDetailStore()
const files = computed(() => torrentDetailStore.currentFiles)
const hash = computed(() => torrentDetailStore.currentHash || '')

const handleRefresh = async () => {
  await torrentDetailStore.fetchDetails()
}
</script>
