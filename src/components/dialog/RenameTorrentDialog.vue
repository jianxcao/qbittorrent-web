<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('common.rename')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120" :show-feedback="false">
      <n-form-item :label="$t('renameDialog.newName')">
        <n-input v-model:value="newName" :placeholder="$t('renameDialog.newNamePlaceholder')" />
      </n-form-item>
    </n-form>
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
defineProps<{
  id?: number // Actually hash string usually, but let's check store
}>()

const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)
const newName = ref('')

const targetTorrent = computed(() => {
  // If id (index/hash?) is passed or use selection
  // In qb-web, torrentStore.selectedKeys are hashes
  const hash = torrentStore.selectedKeys[0]
  return torrentStore.torrents.find((t) => t.hash === hash)
})

watch(show, (v) => {
  if (v && targetTorrent.value) {
    newName.value = targetTorrent.value.name
  }
})

function onCancel() {
  show.value = false
}

async function onConfirm() {
  if (!targetTorrent.value) {
    return
  }
  if (!newName.value) {
    message.error($t('messages.nameRequired'))
    return
  }

  loading.value = true
  try {
    await torrentsApi.rename(targetTorrent.value.hash, newName.value)
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
