<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('renameFolderDialog.title')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <n-space vertical :size="16">
      <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120" :show-feedback="false">
        <n-form-item :label="$t('renameFolderDialog.oldPath')">
          <n-input v-model:value="oldPath" :placeholder="$t('renameFolderDialog.oldPathPlaceholder')" />
        </n-form-item>
        <n-form-item :label="$t('renameFolderDialog.newPath')">
          <n-input v-model:value="newPath" :placeholder="$t('renameFolderDialog.newPathPlaceholder')" />
        </n-form-item>
      </n-form>
    </n-space>
    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading"> {{ $t('common.confirm') }} </n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useTorrentStore } from '@/store'
import * as torrentsApi from '@/api/modules/torrents'
import { useI18n } from 'vue-i18n'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { computed, ref, watch } from 'vue'

const isMobile = useIsSmallScreen()
const labelType = computed(() => (isMobile.value ? 'top' : 'left'))
const show = defineModel<boolean>('show', { required: true })

const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)
const oldPath = ref('')
const newPath = ref('')

const targetTorrent = computed(() => {
  const hash = torrentStore.selectedKeys[0]
  return torrentStore.torrents.find((t) => t.hash === hash)
})

watch(show, (v) => {
  if (v && targetTorrent.value) {
    // 自动填充旧路径为种子名称（通常是根文件夹名）
    oldPath.value = targetTorrent.value.name
    newPath.value = ''
  }
})

function onCancel() {
  show.value = false
}

async function onConfirm() {
  if (!targetTorrent.value) {
    return
  }
  if (!oldPath.value) {
    message.error($t('messages.oldPathRequired'))
    return
  }
  if (!newPath.value) {
    message.error($t('messages.newPathRequired'))
    return
  }

  loading.value = true
  try {
    await torrentsApi.renameFolder(targetTorrent.value.hash, oldPath.value, newPath.value)
    message.success($t('messages.success'))
    show.value = false
    await torrentStore.fetchTorrents()
  } catch (error: any) {
    message.error(error.message || $t('messages.failed'))
  } finally {
    loading.value = false
  }
}
</script>
