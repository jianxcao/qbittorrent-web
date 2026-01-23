import * as torrentsApi from '@/api/modules/torrents'
import { useTorrentDetailStore } from '@/store'
import { useTorrentStore } from '@/store/torrent'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

export function normalizeTrackers(value: string | string[]): string[] {
  const list = Array.isArray(value) ? value : value.split('\n')
  const result: string[] = []
  const seen = new Set<string>()
  list.forEach((item) => {
    const normalized = item.trim()
    if (!normalized || !normalized.includes('://') || seen.has(normalized)) {
      return
    }
    seen.add(normalized)
    result.push(normalized)
  })
  return result
}

export function useTrackerOperations() {
  const torrentStore = useTorrentStore()
  const detailStore = useTorrentDetailStore()
  const message = useMessage()
  const loading = ref(false)

  function getCurrentHash() {
    const hash = torrentStore.selectedKeys[0]
    if (!hash) {
      message.warning('请先选择种子')
      return null
    }
    return hash
  }

  async function addTrackers(urls: string[]) {
    const hash = getCurrentHash()
    if (!hash) {
      return false
    }

    loading.value = true
    try {
      await torrentsApi.addTrackers(hash, urls)
      message.success('添加成功')
      await detailStore.fetchDetails()
      return true
    } catch (error: any) {
      console.error(error)
      message.error(error?.message || '添加失败')
      return false
    } finally {
      loading.value = false
    }
  }

  async function editTracker(origUrl: string, newUrl: string) {
    const hash = getCurrentHash()
    if (!hash) {
      return false
    }

    loading.value = true
    try {
      await torrentsApi.editTracker(hash, origUrl, newUrl)
      message.success('编辑成功')
      await detailStore.fetchDetails()
      return true
    } catch (error: any) {
      console.error(error)
      message.error(error?.message || '编辑失败')
      return false
    } finally {
      loading.value = false
    }
  }

  async function removeTrackers(urls: string[]) {
    const hash = getCurrentHash()
    if (!hash) {
      return false
    }

    loading.value = true
    try {
      await torrentsApi.removeTrackers(hash, urls)
      message.success('已删除')
      await detailStore.fetchDetails()
      return true
    } catch (error: any) {
      console.error(error)
      message.error(error?.message || '删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    addTrackers,
    editTracker,
    removeTrackers
  }
}
