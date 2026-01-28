<template>
  <div class="content-tab h-full flex flex-col">
    <ResizableGridTable
      :columns="columns"
      :data="files"
      :row-key="(row: TorrentFile) => row.index"
      class="flex-1"
      @row-contextmenu="handleContextMenu"
      :min-table-width="1000"
    />
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="contextMenuOptions"
      :show="showContextMenu"
      :on-clickoutside="handleClickOutside"
      @select="handleContextMenuSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { NProgress, NSelect, NDropdown, useMessage, useThemeVars } from 'naive-ui'
import ResizableGridTable from '@/components/ResizableGridTable/ResizableGridTable.vue'
import type { ResizableGridColumn } from '@/components/ResizableGridTable/types'
import { useTorrentDetailStore } from '@/store/torrentDetail'
import { computed } from 'vue'
import { formatSize } from '@/utils'
import type { TorrentFile } from '@/api/types'
import { useI18n } from '@/composables/useI18n'
import { setFilePriority, renameFile } from '@/api/modules/torrents'
import { changeColor } from 'seemly'

const { t } = useI18n()
const message = useMessage()
const torrentDetailStore = useTorrentDetailStore()
const files = computed(() => torrentDetailStore.currentFiles)
const themeVars = useThemeVars()
// 右键菜单相关
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuFile = ref<TorrentFile | null>(null)

const contextMenuOptions = computed(() => [
  {
    label: t('common.rename'),
    key: 'rename'
  }
])

const handleContextMenu = (file: TorrentFile, event: MouseEvent) => {
  contextMenuFile.value = file
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

const handleClickOutside = () => {
  showContextMenu.value = false
}

const handleContextMenuSelect = async (key: string) => {
  showContextMenu.value = false
  if (key === 'rename' && contextMenuFile.value) {
    await handleRenameFile(contextMenuFile.value)
  }
}

const handleRenameFile = async (file: TorrentFile) => {
  const hash = torrentDetailStore.currentHash
  if (!hash) {
    return
  }
  const oldPath = file.name
  const fileName = oldPath.split('/').pop() || oldPath

  // 使用 Naive UI 的 dialog 来获取新名称
  const newName = prompt(t('torrentDetail.content.renamePrompt'), fileName)
  if (!newName || newName === fileName) {
    return
  }

  try {
    const pathParts = oldPath.split('/')
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join('/')

    await renameFile(hash, oldPath, newPath)
    message.success(t('torrentDetail.content.renameSuccess'))
    // 刷新文件列表
    await torrentDetailStore.fetchDetails()
  } catch (error) {
    console.error('Failed to rename file:', error)
    message.error(t('torrentDetail.content.renameFailed'))
  }
}

const priorityOptions = computed(() => [
  { label: t('torrentDetail.content.priorityIgnored'), value: 0 },
  { label: t('torrentDetail.content.priorityNormal'), value: 1 },
  { label: t('torrentDetail.content.priorityHigh'), value: 6 },
  { label: t('torrentDetail.content.priorityMaximum'), value: 7 }
])

const handlePriorityChange = async (file: TorrentFile, priority: 0 | 1 | 6 | 7) => {
  const hash = torrentDetailStore.currentHash
  if (!hash) {
    return
  }

  try {
    await setFilePriority(hash, file.index, priority)
    message.success(t('torrentDetail.content.priorityChangeSuccess'))
    // 刷新文件列表
    await torrentDetailStore.fetchDetails()
  } catch (error) {
    console.error('Failed to change file priority:', error)
    message.error(t('torrentDetail.content.priorityChangeFailed'))
  }
}

const columns = computed<ResizableGridColumn<TorrentFile>[]>(() => [
  {
    title: t('torrentDetail.content.name'),
    key: 'name',
    ellipsis: { tooltip: true },
    sorter: (row1, row2) => row1.name.localeCompare(row2.name)
  },
  {
    title: t('torrentDetail.content.size'),
    key: 'size',
    width: 100,
    align: 'right',
    render(row) {
      return formatSize(row.size)
    },
    sorter: (row1, row2) => row1.size - row2.size
  },
  {
    title: t('torrentDetail.content.progress'),
    key: 'progress',
    width: 150,
    render(row) {
      return h(NProgress, {
        type: 'line',
        percentage: Number((row.progress * 100).toFixed(2)),
        indicatorPlacement: 'inside',
        processing: row.progress < 1 && row.progress > 0,
        status: row.progress === 1 ? 'success' : 'default',
        color: themeVars.value.primaryColor,
        railColor: changeColor(themeVars.value.primaryColor, { alpha: 0.4 }),
        indicatorTextColor: themeVars.value.baseColor
      })
    },
    sorter: (row1, row2) => row1.progress - row2.progress
  },
  {
    title: t('torrentDetail.content.priority'),
    key: 'priority',
    width: 120,
    render(row) {
      return h(NSelect, {
        value: row.priority,
        options: priorityOptions.value,
        size: 'small',
        onUpdateValue: (value: 0 | 1 | 6 | 7) => handlePriorityChange(row, value)
      })
    },
    sorter: (row1, row2) => row1.priority - row2.priority
  },
  {
    title: t('torrentDetail.content.availability'),
    key: 'availability',
    width: 80,
    render(row) {
      return row.availability.toFixed(3)
    },
    sorter: (row1, row2) => row1.availability - row2.availability
  }
])
</script>
