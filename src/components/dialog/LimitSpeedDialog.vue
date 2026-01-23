<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="title"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">{{ $t('limitSpeedDialog.selectedCount', { count: selectedCount }) }}</div>
    <n-space vertical>
      <n-checkbox v-model:checked="unlimited">
        {{ $t('limitSpeedDialog.unlimited') }}
      </n-checkbox>
      <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120" :show-feedback="false">
        <n-form-item :label="valueLabel">
          <n-input-number
            v-model:value="speedValue"
            :disabled="unlimited"
            :min="0"
            :step="1"
            :show-button="false"
            style="width: 160px"
          />
          <span class="unit">KiB/s</span>
        </n-form-item>
      </n-form>
    </n-space>
    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading">{{ $t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import * as torrentsApi from '@/api/modules/torrents'
import { useTorrentStore } from '@/store'
import { sleep } from '@/utils'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'

type LimitType = 'download' | 'upload'

const show = defineModel<boolean>('show', { required: true })
const props = defineProps<{
  hashes?: string[]
  type: LimitType
}>()

const isMobile = useIsSmallScreen()
const labelType = computed(() => (isMobile.value ? 'top' : 'left'))
const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)

const unlimited = ref(false)
const speedValue = ref<number | null>(0)

const targetHashes = computed(() => {
  if (props.hashes && props.hashes.length > 0) {
    return props.hashes
  }
  return torrentStore.selectedKeys
})

const selectedTorrents = computed(() => {
  const hashes = new Set(targetHashes.value)
  return torrentStore.torrents.filter((t) => hashes.has(t.hash))
})

const selectedCount = computed(() => targetHashes.value.length)

const title = computed(() =>
  props.type === 'download' ? $t('limitSpeedDialog.downloadTitle') : $t('limitSpeedDialog.uploadTitle')
)

const valueLabel = computed(() =>
  props.type === 'download' ? $t('common.downloadSpeed') : $t('common.uploadSpeed')
)

watch(show, (v) => {
  if (v) {
    const target = selectedTorrents.value[0]
    const limit = target ? (props.type === 'download' ? target.dl_limit : target.up_limit) : -1
    if (limit === -1) {
      unlimited.value = true
      speedValue.value = 0
    } else {
      unlimited.value = false
      speedValue.value = Math.max(0, Math.round(limit / 1024))
    }
  }
})

async function onConfirm() {
  const hashes = targetHashes.value
  if (!hashes.length) {
    message.warning($t('messages.pleaseSelectTask'))
    return
  }

  if (!unlimited.value && (speedValue.value === null || speedValue.value < 0)) {
    message.error($t('limitSpeedDialog.invalidValue'))
    return
  }

  loading.value = true
  try {
    const limit = unlimited.value ? -1 : Math.round((speedValue.value ?? 0) * 1024)
    if (props.type === 'download') {
      await torrentsApi.setDownloadLimit(hashes, limit)
    } else {
      await torrentsApi.setUploadLimit(hashes, limit)
    }
    show.value = false
    message.success($t('limitSpeedDialog.success'))
    await sleep(500)
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('limitSpeedDialog.failed'))
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
.unit {
  margin-left: 8px;
  color: #999;
}
</style>
