<template>
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    :x="x"
    :y="y"
    :options="dropdownOptions"
    :show="showDropdown"
    :on-clickoutside="handleClickOutside"
    @select="handleSelect"
  />
  <DeleteTorrentDialog v-model:show="showDeleteDialog" :hashes="hashesToDelete" @success="handleDeleteSuccess" />
</template>

<script setup lang="ts">
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import { Play, Pause, Trash } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref } from 'vue'
import { pause, resume } from '@/api/modules/torrents'
import { useMessage } from 'naive-ui'
import DeleteTorrentDialog from '@/components/dialog/DeleteTorrentDialog.vue'
import { qbStatusFilters } from '@/const/status'

const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const message = useMessage()

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const currentStatusKey = ref('')
const showDeleteDialog = ref(false)
const hashesToDelete = ref<string[]>([])

const handleClickOutside = () => {
  showDropdown.value = false
}

const show = (e: MouseEvent, key: string) => {
  e.preventDefault()
  showDropdown.value = false
  nextTick().then(() => {
    showDropdown.value = true
    x.value = e.clientX
    y.value = e.clientY
    currentStatusKey.value = key
  })
}

// 获取当前状态下的所有种子 hash
const getTargetHashes = () => {
  if (!currentStatusKey.value) {
    return []
  }

  // 直接使用 store 中已筛选的种子（保留了搜索、标签、分类等上下文）
  const candidates = torrentStore.filterTorrents

  if (currentStatusKey.value === 'all') {
    return candidates.map((t) => t.hash)
  }

  const statusFilter = qbStatusFilters.find((f) => f.key === currentStatusKey.value)
  if (!statusFilter) {
    return []
  }

  // 在当前筛选结果的基础上，进一步筛选符合右键选中状态的种子
  return candidates.filter((t) => statusFilter.filter(t)).map((t) => t.hash)
}

const selectedHashes = computed(() => getTargetHashes())

const dropdownOptions = computed(() => {
  const isDisabled = selectedHashes.value.length === 0
  return [
    {
      label: $t('sidebar.resume'),
      key: 'resume',
      icon: renderIcon(Play, '#27ae60'),
      disabled: isDisabled
    },
    {
      label: $t('sidebar.pause'),
      key: 'pause',
      icon: renderIcon(Pause, '#f39c12'),
      disabled: isDisabled
    },
    {
      label: $t('sidebar.delete'),
      key: 'delete',
      icon: renderIcon(Trash, '#d03050'),
      disabled: isDisabled
    }
  ]
})

const handleSelect = async (key: string) => {
  showDropdown.value = false
  const hashes = getTargetHashes()

  if (hashes.length === 0) {
    message.warning($t('common.noData'))
    return
  }

  try {
    if (key === 'resume') {
      await resume(hashes)
      message.success($t('message.taskStarted'))
    } else if (key === 'pause') {
      await pause(hashes)
      message.success($t('message.taskPaused'))
    } else if (key === 'delete') {
      console.debug(hashes, 'hashes')
      hashesToDelete.value = hashes
      showDeleteDialog.value = true
    }
  } catch (e: any) {
    message.error(e.message || $t('common.operationFailed'))
  }
}

const handleDeleteSuccess = () => {
  showDeleteDialog.value = false
}

defineExpose({
  show
})
</script>
