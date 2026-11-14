<template>
  <div class="general-tab h-full overflow-y-auto p-4">
    <div v-if="properties">
      <!-- 进度条 -->
      <div v-if="currentTorrent" class="progress-section">
        <n-progress type="line" :percentage="progressPercentage" />
      </div>
      <div v-if="currentTags.length" class="tag-section">
        <span class="tag-label">{{ $t('torrentDetail.general.tags') }}</span>
        <n-tag
          v-for="tag in currentTags"
          :key="tag"
          size="small"
          :bordered="false"
          :color="tagColors[tag]"
        >
          {{ tag }}
        </n-tag>
      </div>

      <!-- 传输信息 -->
      <TransferInfo :properties="properties" />

      <!-- 种子信息 -->
      <TorrentInfo
        :properties="properties"
        :hash="torrentDetailStore.currentHash"
        v-if="torrentDetailStore.currentHash"
      />
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
import { tagColor } from '@/utils/tagColor'

const torrentStore = useTorrentStore()
const torrentDetailStore = useTorrentDetailStore()
const properties = computed(() => torrentDetailStore.currentProperties)

const currentTorrent = computed(() => {
  const hash = torrentDetailStore.currentHash
  return hash ? torrentStore.torrentsMap[hash] : null
})

const progressPercentage = computed(() => {
  return currentTorrent.value ? currentTorrent.value.progress * 100 : 0
})

const currentTags = computed(() => currentTorrent.value?.tagsArray || [])
const tagColors = computed(() => {
  return Object.fromEntries(
    currentTags.value.map((tag) => {
      const color = tagColor(tag)
      return [tag, { color: color.background, textColor: color.text, borderColor: color.border }]
    })
  )
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

.tag-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 8px 0 12px;
}

.tag-label {
  color: var(--n-text-color-3);
  font-size: 12px;
}
</style>
