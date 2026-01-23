<template>
  <div class="peers-tab h-full flex flex-col">
    <ResizableGridTable
      v-model:selected-keys="selectedPeerKeys"
      :columns="columns"
      :data="peersList"
      :row-key="getPeerKey"
      selectable
      class="flex-1"
      @row-contextmenu="onRowContextMenu"
    />
    <PeerContextMenu ref="contextMenuRef" />
  </div>
</template>

<script setup lang="ts">
import ResizableGridTable from '@/components/ResizableGridTable/ResizableGridTable.vue'
import PeerContextMenu from './PeersTab/PeerContextMenu.vue'
import type { ResizableGridColumn } from '@/components/ResizableGridTable/types'
import { useTorrentDetailStore } from '@/store/torrentDetail'
import { computed, ref } from 'vue'
import { formatSpeed, formatSize } from '@/utils'
import type { TorrentPeer } from '@/api/types'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const torrentDetailStore = useTorrentDetailStore()

// Convert Record<string, TorrentPeer> to Array
const peersList = computed(() => Object.values(torrentDetailStore.currentPeers))

// 将国家代码转换为 emoji 国旗
const getCountryFlag = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) {
    return ''
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// 生成 peer 的唯一 key（IP:端口）
const getPeerKey = (peer: TorrentPeer) => {
  return `${peer.ip}:${peer.port}`
}

const contextMenuRef = ref<InstanceType<typeof PeerContextMenu>>()
const selectedPeerKeys = computed({
  get: () => contextMenuRef.value?.selectedPeerKeys ?? [],
  set: (val) => {
    if (contextMenuRef.value) {
      contextMenuRef.value.selectedPeerKeys = val
    }
  }
})

function onRowContextMenu(row: TorrentPeer, event: MouseEvent) {
  contextMenuRef.value?.onRowContextMenu(row, event)
}

const columns = computed<ResizableGridColumn<TorrentPeer>[]>(() => [
  {
    title: t('torrentDetail.peers.ip'),
    key: 'ip',
    width: 300,
    ellipsis: { tooltip: true },
    sorter: (row1, row2) => row1.ip.localeCompare(row2.ip)
  },
  {
    title: t('torrentDetail.peers.country'),
    key: 'country',
    width: 150,
    render(row) {
      const flag = getCountryFlag(row.country_code)
      return flag ? `${flag} ${row.country}` : row.country
    },
    sorter: (row1, row2) => row1.country.localeCompare(row2.country)
  },
  {
    title: t('torrentDetail.peers.port'),
    key: 'port',
    width: 80
  },
  {
    title: t('torrentDetail.peers.connection'),
    key: 'connection',
    width: 80
  },
  {
    title: t('torrentDetail.peers.client'),
    key: 'client',
    width: 150,
    ellipsis: { tooltip: true }
  },
  {
    title: t('torrentDetail.peers.flags'),
    key: 'flags',
    width: 100,
    ellipsis: { tooltip: true }
  },
  {
    title: t('torrentDetail.peers.progress'),
    key: 'progress',
    width: 120,
    render(row) {
      return (row.progress * 100).toFixed(1) + '%'
    },
    sorter: (row1, row2) => row1.progress - row2.progress
  },
  {
    title: t('common.downloadSpeed'),
    key: 'dl_speed',
    width: 120,
    align: 'right',
    render(row) {
      return formatSpeed(row.dl_speed)
    },
    sorter: (row1, row2) => row1.dl_speed - row2.dl_speed
  },
  {
    title: t('common.uploadSpeed'),
    key: 'up_speed',
    width: 120,
    align: 'right',
    render(row) {
      return formatSpeed(row.up_speed)
    },
    sorter: (row1, row2) => row1.up_speed - row2.up_speed
  },
  {
    title: t('common.downloaded'),
    key: 'downloaded',
    width: 120,
    align: 'right',
    render(row) {
      return formatSize(row.downloaded)
    },
    sorter: (row1, row2) => row1.downloaded - row2.downloaded
  },
  {
    title: t('common.uploaded'),
    key: 'uploaded',
    width: 120,
    align: 'right',
    render(row) {
      return formatSize(row.uploaded)
    },
    sorter: (row1, row2) => row1.uploaded - row2.uploaded
  }
])
</script>
