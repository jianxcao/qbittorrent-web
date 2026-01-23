<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('changeDirDialog.title')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">{{ $t('common.selectedCount', { count: selectedTorrents.length }) }}</div>
    <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120" :show-feedback="false">
      <n-form-item :label="$t('changeDirDialog.newDir')">
        <n-auto-complete
          v-model:value="newDir"
          :options="downloadDirOptions"
          :placeholder="$t('changeDirDialog.newDirPlaceholder')"
          clearable
          :get-show="() => true"
        />
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
const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)
const newDir = ref('')

const selectedTorrents = computed(() => {
  return torrentStore.torrents.filter((t) => torrentStore.selectedKeys.includes(t.hash))
})

const downloadDirOptions = computed(() => {
  return torrentStore.downloadDirOptions
    .filter((item: any) => item.key !== 'all')
    .map((item: any) => ({
      label: item.key,
      value: item.key
    }))
})

watch(show, (v) => {
  if (v && selectedTorrents.value.length > 0) {
    // Default to the first selected torrent's save path
    newDir.value = selectedTorrents.value[0].save_path || ''
  }
})

async function onConfirm() {
  if (!newDir.value.trim()) {
    message.error($t('changeDirDialog.pleaseInputDir'))
    return
  }

  loading.value = true
  try {
    await torrentsApi.setLocation(torrentStore.selectedKeys, newDir.value.trim())
    show.value = false
    message.success($t('changeDirDialog.changeSuccess'))
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('changeDirDialog.changeFailed'))
  } finally {
    loading.value = false
  }
}

function onCancel() {
  show.value = false
}
</script>

<style scoped lang="less">
.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
