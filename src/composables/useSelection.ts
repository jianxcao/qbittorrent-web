import { ref, computed } from 'vue'

// 通用 选中逻辑，负责选中行
// 支持 hash (string) 作为唯一标识符
export function useSelection<T extends { hash: string }>(items: () => T[]) {
  console.debug('useSelection', items())
  const selectedKeys = ref<string[]>([])
  const lastSelectedHash = ref<string | null>(null)
  const mapSelectedKeys = computed(() =>
    selectedKeys.value.reduce(
      (acc, hash) => {
        acc[hash] = true
        return acc
      },
      {} as Record<string, boolean>
    )
  )
  // 设置选中
  function setSelectedKeys(keys: string[]) {
    selectedKeys.value = [...keys]
  }
  // 切换选中
  function toggleSelectedKey(key: string) {
    if (selectedKeys.value.includes(key)) {
      selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
    } else {
      selectedKeys.value = [...selectedKeys.value, key]
    }
  }
  // 清空选中
  function clearSelectedKeys() {
    selectedKeys.value = []
    lastSelectedHash.value = null
  }
  // 选中范围
  function selectRange(currentIndex: number) {
    let latestIndex = -1
    const currentItems = items()
    if (lastSelectedHash.value) {
      latestIndex = currentItems.findIndex((t) => t.hash === lastSelectedHash.value)
    }
    if (latestIndex == -1) {
      selectedKeys.value = [currentItems[currentIndex]?.hash]
      latestIndex = currentIndex
      return
    }
    const start = Math.min(latestIndex, currentIndex)
    const end = Math.max(latestIndex, currentIndex)
    const rangeHashes = currentItems
      .slice(start, end + 1)
      .map((t) => t.hash)
    selectedKeys.value = rangeHashes
  }

  function setLastSelectedHash(hash: string) {
    lastSelectedHash.value = hash
  }

  return {
    mapSelectedKeys,
    selectedKeys,
    setSelectedKeys,
    toggleSelectedKey,
    clearSelectedKeys,
    selectRange,
    lastSelectedHash,
    setLastSelectedHash
  }
}
