import { ref, computed } from 'vue'

// 通用 选中逻辑，负责选中行
// 支持 hash (string) 作为唯一标识符
export function useSelection<T extends { hash: string }>(items: () => T[]) {
  const selectedKeys = ref<string[]>([])
  const lastSelectedIndex = ref<number | null>(null)
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
    lastSelectedIndex.value = null
  }
  // 选中范围
  function selectRange(currentIndex: number) {
    if (lastSelectedIndex.value === null) {
      selectedKeys.value = [items()[currentIndex]?.hash]
      lastSelectedIndex.value = currentIndex
      return
    }
    const start = Math.min(lastSelectedIndex.value, currentIndex)
    const end = Math.max(lastSelectedIndex.value, currentIndex)
    const rangeHashes = items()
      .slice(start, end + 1)
      .map((t) => t.hash)
    selectedKeys.value = rangeHashes
  }

  function setLastSelectedIndex(idx: number) {
    lastSelectedIndex.value = idx
  }

  return {
    mapSelectedKeys,
    selectedKeys,
    setSelectedKeys,
    toggleSelectedKey,
    clearSelectedKeys,
    selectRange,
    lastSelectedIndex,
    setLastSelectedIndex
  }
}
