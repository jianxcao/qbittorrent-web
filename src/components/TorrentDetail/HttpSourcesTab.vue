<template>
  <div class="http-sources-tab h-full flex flex-col">
    <ResizableGridTable :columns="columns" :data="webSeeds" class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import ResizableGridTable from '@/components/ResizableGridTable/ResizableGridTable.vue'
import type { ResizableGridColumn } from '@/components/ResizableGridTable/types'
import { useTorrentDetailStore } from '@/store/torrentDetail'
import { computed } from 'vue'
import type { WebSeed } from '@/api/types'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const torrentDetailStore = useTorrentDetailStore()
const webSeeds = computed(() => torrentDetailStore.currentWebSeeds)

const columns = computed<ResizableGridColumn<WebSeed>[]>(() => [
  {
    title: t('torrentDetail.httpSources.url'),
    key: 'url',
    ellipsis: { tooltip: true }
  }
])
</script>
