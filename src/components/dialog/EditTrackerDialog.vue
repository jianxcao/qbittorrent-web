<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('editTrackerDialog.title', 'Edit Tracker')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 640px"
  >
    <div class="mb-2">
      {{ $t('common.selectedCount', { count: selectedTorrents.length }, 'Selected {count} torrents') }}
    </div>
    <div class="mb-2 text-muted">
      {{ $t('editTrackerDialog.batchHint', 'Batch update runs one-by-one, some items may fail.') }}
    </div>
    <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 140" :show-feedback="false">
      <n-form-item :label="$t('editTrackerDialog.trackers', 'Trackers')">
        <n-input
          v-model:value="trackersInput"
          type="textarea"
          :placeholder="$t('editTrackerDialog.trackersPlaceholder', 'One tracker per line')"
          clearable
          :rows="6"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading">{{ $t('common.confirm') }}</n-button>
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
const trackersInput = ref('')
const currentTrackers = ref<string[]>([])
const maxConcurrency = 6

const selectedTorrents = computed(() => {
  return torrentStore.torrents.filter((t) => torrentStore.selectedKeys.includes(t.hash))
})

watch(show, async (v) => {
  if (!v) {
    trackersInput.value = ''
    currentTrackers.value = []
    return
  }

  trackersInput.value = ''
  currentTrackers.value = []

  const firstHash = torrentStore.selectedKeys[0]
  if (!firstHash) {
    return
  }

  try {
    const trackers = await torrentsApi.getTrackers(firstHash)
    currentTrackers.value = normalizeTrackers(trackers.map((tracker) => tracker.url))
    if (currentTrackers.value.length > 0) {
      trackersInput.value = currentTrackers.value.join('\n')
    }
  } catch (error) {
    console.error(error)
  }
})

function normalizeTrackers(value: string | string[]): string[] {
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

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  for (let i = 0; i < tasks.length; i += limit) {
    const chunk = tasks.slice(i, i + limit).map((task) => task())
    const settled = await Promise.allSettled(chunk)
    results.push(...settled)
  }
  return results
}

async function onConfirm() {
  const hashes = torrentStore.selectedKeys.slice()
  if (hashes.length === 0) {
    message.warning($t('messages.pleaseSelectTask'))
    return
  }

  const desiredTrackers = normalizeTrackers(trackersInput.value)
  if (desiredTrackers.length === 0) {
    message.error($t('editTrackerDialog.trackersRequired', 'Please input trackers'))
    return
  }

  loading.value = true
  try {
    const results = await runWithConcurrency(
      hashes.map((hash) => async () => {
        const trackers = await torrentsApi.getTrackers(hash)
        const current = normalizeTrackers(trackers.map((tracker) => tracker.url))
        const currentSet = new Set(current)
        const desiredSet = new Set(desiredTrackers)
        const toAdd = desiredTrackers.filter((url) => !currentSet.has(url))
        const toRemove = current.filter((url) => !desiredSet.has(url))

        if (toAdd.length > 0) {
          await torrentsApi.addTrackers(hash, toAdd)
        }
        if (toRemove.length > 0) {
          await torrentsApi.removeTrackers(hash, toRemove)
        }
      }),
      maxConcurrency
    )
    const failedCount = results.filter((item) => item.status === 'rejected').length
    if (failedCount > 0) {
      message.error($t('editTrackerDialog.changeFailed', { count: failedCount }, 'Failed to edit {count} torrents'))
    } else {
      message.success($t('editTrackerDialog.changeSuccess', 'Trackers updated'))
    }
    show.value = false
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('editTrackerDialog.changeFailed', { count: hashes.length }, 'Failed to edit trackers'))
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
.text-muted {
  color: rgba(255, 255, 255, 0.65);
}
</style>
