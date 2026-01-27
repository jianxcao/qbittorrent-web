<template>
  <div class="transfer-info">
    <h3 class="section-title">{{ $t('torrentDetail.transfer.title') }}</h3>
    <n-descriptions label-placement="left" bordered :column="isMobile ? 1 : 2">
      <!-- 活动时间 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.timeActive')">
        {{ formatDuration(properties.time_elapsed) }}
      </n-descriptions-item>
      <!-- 剩余时间 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.eta')">
        {{ formatDuration(properties.eta) }}
      </n-descriptions-item>
      
      <!-- 已下载 -->
      <n-descriptions-item :label="$t('common.downloaded')">
        {{ formatSize(properties.total_downloaded) }}
        ({{ $t('torrentDetail.transfer.sessionSuffix') }} {{ formatSize(properties.total_downloaded_session) }})
      </n-descriptions-item>
      <!-- 已上传 -->
      <n-descriptions-item :label="$t('common.uploaded')">
        {{ formatSize(properties.total_uploaded) }}
        ({{ $t('torrentDetail.transfer.sessionSuffix') }} {{ formatSize(properties.total_uploaded_session) }})
      </n-descriptions-item>
      
      <!-- 下载速度 -->
      <n-descriptions-item :label="$t('common.downloadSpeed')">
        {{ formatSpeed(properties.dl_speed) }}
        ({{ $t('torrentDetail.transfer.average') }} {{ formatSpeed(properties.dl_speed_avg) }})
      </n-descriptions-item>
      <!-- 上传速度 -->
      <n-descriptions-item :label="$t('common.uploadSpeed')">
        {{ formatSpeed(properties.up_speed) }}
        ({{ $t('torrentDetail.transfer.average') }} {{ formatSpeed(properties.up_speed_avg) }})
      </n-descriptions-item>
      
      <!-- 下载限制 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.dlLimit')">
        {{ properties.dl_limit === -1 ? '∞' : formatSpeed(properties.dl_limit) }}
      </n-descriptions-item>
      <!-- 上传限制 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.upLimit')">
        {{ properties.up_limit === -1 ? '∞' : formatSpeed(properties.up_limit) }}
      </n-descriptions-item>
      
      <!-- 分享率 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.shareRatio')">
        {{ properties.share_ratio.toFixed(2) }}
      </n-descriptions-item>
      <!-- 下次汇报 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.reannounce')">
        {{ properties.reannounce || 0 }}
      </n-descriptions-item>
      
      <!-- 流行度 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.popularity')">
        {{ properties.nb_connections > 0 ? (properties.seeds / properties.nb_connections).toFixed(2) : '0.00' }}
      </n-descriptions-item>
      <!-- 连接 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.connections')">
        {{ properties.nb_connections }} ({{ $t('torrentDetail.transfer.max') }} {{ properties.nb_connections_limit || 1000 }})
      </n-descriptions-item>
      
      <!-- 种子 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.seeds')">
        {{ properties.seeds }} ({{ $t('torrentDetail.transfer.total') }} {{ properties.seeds_total }})
      </n-descriptions-item>
      <!-- 用户 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.peers')">
        {{ properties.peers }} ({{ $t('torrentDetail.transfer.total') }} {{ properties.peers_total }})
      </n-descriptions-item>
      
      <!-- 已丢弃 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.wasted')">
        {{ formatSize(properties.total_wasted) }}
      </n-descriptions-item>
      <!-- 最后完整可见 -->
      <n-descriptions-item :label="$t('torrentDetail.transfer.lastSeenComplete')">
        {{ properties.last_seen > 0 ? formatDate(properties.last_seen) : '∞' }}
      </n-descriptions-item>
    </n-descriptions>
  </div>
</template>

<script setup lang="ts">
import type { TorrentProperties } from '@/api/types'
import { formatSize, formatSpeed, timeToStr as formatDuration, formatTimestamp as formatDate } from '@/utils'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'

const isMobile = useIsSmallScreen()

defineProps<{
  properties: TorrentProperties
}>()
</script>

<style scoped>
.transfer-info {
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
