<template>
  <n-dropdown
    v-model:show="showMenu"
    trigger="manual"
    :x="menuX"
    :y="menuY"
    :options="menuOptions"
    :animated="false"
    :z-index="1000"
    @select="onMenuSelect"
  />
  <AddTrackerDialog v-model:show="showAddDialog" />
  <EditTrackerDialog v-model:show="showEditDialog" :original-url="editUrl" />
  <DeleteTrackerDialog v-model:show="showDeleteDialog" :tracker-urls="selectedTrackerKeys" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { copyToClipboard } from '@/utils'
import { useTrackerMenu } from './useTrackerMenu'
import AddTrackerDialog from './AddTrackerDialog.vue'
import EditTrackerDialog from './EditTrackerDialog.vue'
import DeleteTrackerDialog from './DeleteTrackerDialog.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const {
  showMenu,
  menuX,
  menuY,
  selectedTrackerKeys,
  menuOptions,
  onRowContextMenu: handleRowContextMenu
} = useTrackerMenu()

const message = useMessage()
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editUrl = ref('')

async function onMenuSelect(key: string) {
  showMenu.value = false

  if (key === 'add') {
    showAddDialog.value = true
    return
  }

  if (key === 'edit') {
    if (selectedTrackerKeys.value.length !== 1) {
      return
    }
    editUrl.value = selectedTrackerKeys.value[0]
    showEditDialog.value = true
    return
  }

  if (key === 'remove') {
    showDeleteDialog.value = true
    return
  }

  if (key === 'copy') {
    const success = await copyToClipboard(selectedTrackerKeys.value.join('\n'))
    if (success) {
      message.success(t('torrentDetail.trackers.copied'))
    } else {
      message.error(t('messages.copyFailed'))
    }
  }
}

defineExpose({
  onRowContextMenu: handleRowContextMenu,
  selectedTrackerKeys
})
</script>
