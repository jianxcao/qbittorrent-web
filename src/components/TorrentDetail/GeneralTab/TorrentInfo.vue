<template>
  <div class="torrent-info">
    <h3 class="section-title">{{ $t('torrentDetail.info.title') }}</h3>
    <n-descriptions label-placement="left" bordered :column="isMobile ? 1 : 2">
      <!-- 总大小 -->
      <n-descriptions-item :label="$t('torrentDetail.info.totalSize')">
        {{ formatSize(properties.total_size) }}
      </n-descriptions-item>
      <!-- 区块 -->
      <n-descriptions-item :label="$t('torrentDetail.info.pieces')">
        {{ properties.pieces_num }} x {{ formatSize(properties.piece_size) }} ({{ $t('torrentDetail.info.completed') }}
        {{ properties.pieces_have }})
      </n-descriptions-item>

      <!-- 添加于 -->
      <n-descriptions-item :label="$t('torrentDetail.info.additionDate')">
        {{ formatDate(properties.addition_date) }}
      </n-descriptions-item>
      <!-- 完成于 -->
      <n-descriptions-item :label="$t('torrentDetail.info.completionDate')">
        {{ properties.completion_date > 0 ? formatDate(properties.completion_date) : '' }}
      </n-descriptions-item>

      <!-- 创建 -->
      <n-descriptions-item :label="$t('torrentDetail.info.createdBy')">
        {{ properties.created_by || 'N/A' }}
      </n-descriptions-item>
      <!-- 创建于 -->
      <n-descriptions-item :label="$t('torrentDetail.info.creationDate')">
        {{ properties.creation_date > 0 ? formatDate(properties.creation_date) : '' }}
      </n-descriptions-item>

      <!-- 私密 -->
      <n-descriptions-item :label="$t('torrentDetail.info.private')">
        {{ properties.is_private ? $t('common.yes') : $t('common.no') }}
      </n-descriptions-item>
      <!-- 空白占位 (仅 PC 端) -->
      <n-descriptions-item v-if="!isMobile" label=" "> &nbsp; </n-descriptions-item>

      <!-- 信息哈希值 v1 -->
      <n-descriptions-item :label="$t('torrentDetail.info.hashV1')" :span="2">
        {{ hash }}
      </n-descriptions-item>

      <!-- 信息哈希值 v2 -->
      <n-descriptions-item :label="$t('torrentDetail.info.hashV2')" :span="2">
        {{ properties.infohash_v2 || 'N/A' }}
      </n-descriptions-item>

      <!-- 保存路径 -->
      <n-descriptions-item :label="$t('torrentDetail.info.savePath')" :span="2">
        {{ properties.save_path }}
      </n-descriptions-item>

      <!-- 注释 -->
      <n-descriptions-item :label="$t('torrentDetail.info.comment')" :span="2">
        {{ properties.comment || '' }}
      </n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<script setup lang="ts">
import type { TorrentProperties } from '@/api/types'
import { formatSize, formatTimestamp as formatDate } from '@/utils'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'

const isMobile = useIsSmallScreen()

defineProps<{
  properties: TorrentProperties
  hash: string
}>()
</script>

<style scoped>
.torrent-info {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-descriptions) {
  --n-th-padding: 8px 12px;
  --n-td-padding: 8px 12px;
}
</style>
