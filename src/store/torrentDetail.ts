import type { TorrentProperties, Tracker, WebSeed, TorrentFile, TorrentPeer } from '@/api/types'
import { getTorrentPeers } from '@/api/modules/sync'
import { getProperties, getTrackers, getWebSeeds, getFiles } from '@/api/modules/torrents'
import { useSettingStore } from '@/store/setting'
import { useTorrentStore } from '@/store/torrent'
import { useIntervalFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useTorrentDetailStore = defineStore('torrentDetail', () => {
  const settingStore = useSettingStore()
  const torrentStore = useTorrentStore()

  // 详情同步 ID
  const detailRid = ref<number>(0)

  // 详情页相关状态
  const activeDetailTab = ref<'general' | 'trackers' | 'peers' | 'httpSources' | 'content'>('general')
  const currentProperties = ref<TorrentProperties | null>(null)
  const currentTrackers = ref<Tracker[]>([])
  const currentWebSeeds = ref<WebSeed[]>([])
  const currentFiles = ref<TorrentFile[]>([])
  const currentPeers = ref<Record<string, TorrentPeer>>({})

  // 重置详情数据
  function resetDetails() {
    currentProperties.value = null
    currentTrackers.value = []
    currentWebSeeds.value = []
    currentFiles.value = []
    currentPeers.value = {}
    detailRid.value = 0
  }

  // 获取详情数据
  async function fetchDetails() {
    if (torrentStore.selectedKeys.length === 0) {
      resetDetails()
      return
    }

    const hash = torrentStore.selectedKeys[0]

    try {
      if (activeDetailTab.value === 'general') {
        const props = await getProperties(hash)
        currentProperties.value = props
      } else if (activeDetailTab.value === 'trackers') {
        const trackers = await getTrackers(hash)
        currentTrackers.value = trackers
      } else if (activeDetailTab.value === 'peers') {
        const res = await getTorrentPeers(hash, detailRid.value)
        // 更新详情同步 ID
        detailRid.value = res.rid

        // 处理 peers 数据
        if (res.full_update) {
          currentPeers.value = res.peers || {}
        } else {
          const newPeers = { ...currentPeers.value }
          if (res.peers) {
            for (const [ip, peer] of Object.entries(res.peers)) {
              if (newPeers[ip]) {
                newPeers[ip] = { ...newPeers[ip], ...peer }
              } else {
                newPeers[ip] = peer
              }
            }
          }
          if (res.peers_removed) {
            res.peers_removed.forEach((key) => delete newPeers[key])
          }
          currentPeers.value = newPeers
        }
      } else if (activeDetailTab.value === 'httpSources') {
        const webSeeds = await getWebSeeds(hash)
        currentWebSeeds.value = webSeeds
      } else if (activeDetailTab.value === 'content') {
        const files = await getFiles(hash)
        currentFiles.value = files
      }
    } catch (e) {
      console.error('Failed to fetch torrent details:', e)
    }
  }

  // 监听选中的种子变化，重置详情数据
  watch(
    () => torrentStore.selectedKeys,
    () => {
      resetDetails()
      // 立即获取新种子的详情
      fetchDetails()
    }
  )

  // 监听 tab 变化，立即获取数据
  watch(activeDetailTab, () => {
    // 切换 tab 时重置 rid，确保 peers 获取完整数据
    if (activeDetailTab.value === 'peers') {
      detailRid.value = 0
      currentPeers.value = {}
    }
    fetchDetails()
  })

  // 详情页轮询
  const detailInterval = computed(() => settingStore.setting.polling.torrentDetailInterval * 1000)
  const { pause: stopDetailPolling, resume: startDetailPolling } = useIntervalFn(fetchDetails, detailInterval, {
    immediate: false
  })

  return {
    // 状态
    activeDetailTab,
    currentProperties,
    currentTrackers,
    currentWebSeeds,
    currentFiles,
    currentPeers,
    detailRid,

    // 方法
    fetchDetails,
    resetDetails,
    startDetailPolling,
    stopDetailPolling
  }
})
