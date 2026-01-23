<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('shareLimitDialog.title')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">{{ $t('shareLimitDialog.selectedCount', { count: selectedCount }) }}</div>
    <n-radio-group v-model:value="mode">
      <n-space vertical>
        <n-radio value="global">{{ $t('shareLimitDialog.useGlobal') }}</n-radio>
        <n-radio value="unlimited">{{ $t('shareLimitDialog.noLimit') }}</n-radio>
        <n-radio value="custom">{{ $t('shareLimitDialog.setLimit') }}</n-radio>
      </n-space>
    </n-radio-group>
    <div class="custom-section" :class="{ disabled: mode !== 'custom' }">
      <div class="custom-row">
        <n-checkbox v-model:checked="ratioEnabled" :disabled="mode !== 'custom'">
          {{ $t('shareLimitDialog.ratio') }}
        </n-checkbox>
        <n-input-number
          v-model:value="ratioLimit"
          :disabled="mode !== 'custom' || !ratioEnabled"
          :min="0"
          :step="0.1"
          :show-button="false"
          style="width: 160px"
        />
      </div>
      <div class="custom-row">
        <n-checkbox v-model:checked="seedingEnabled" :disabled="mode !== 'custom'">
          {{ $t('shareLimitDialog.totalMinutes') }}
        </n-checkbox>
        <n-input-number
          v-model:value="seedingTimeLimit"
          :disabled="mode !== 'custom' || !seedingEnabled"
          :min="0"
          :step="1"
          :show-button="false"
          style="width: 160px"
        />
      </div>
      <div class="custom-row">
        <n-checkbox v-model:checked="inactiveEnabled" :disabled="mode !== 'custom'">
          {{ $t('shareLimitDialog.inactiveMinutes') }}
        </n-checkbox>
        <n-input-number
          v-model:value="inactiveTimeLimit"
          :disabled="mode !== 'custom' || !inactiveEnabled"
          :min="0"
          :step="1"
          :show-button="false"
          style="width: 160px"
        />
      </div>
    </div>
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

type Mode = 'global' | 'unlimited' | 'custom'

const show = defineModel<boolean>('show', { required: true })
const props = defineProps<{
  hashes?: string[]
}>()

const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)

const mode = ref<Mode>('global')
const ratioEnabled = ref(false)
const ratioLimit = ref<number | null>(0)
const seedingEnabled = ref(false)
const seedingTimeLimit = ref<number | null>(0)
const inactiveEnabled = ref(false)
const inactiveTimeLimit = ref<number | null>(0)

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

watch(show, (v) => {
  if (v) {
    const target = selectedTorrents.value[0]
    if (!target) {
      mode.value = 'global'
      ratioEnabled.value = false
      ratioLimit.value = 0
      seedingEnabled.value = false
      seedingTimeLimit.value = 0
      inactiveEnabled.value = false
      inactiveTimeLimit.value = 0
      return
    }

    const ratio = target.max_ratio
    const seeding = target.max_seeding_time
    const inactive = target.max_inactive_seeding_time || 0
    const allGlobal = [ratio, seeding, inactive].every((v) => v === -2)
    const allUnlimited = [ratio, seeding, inactive].every((v) => v === -1)

    mode.value = allGlobal ? 'global' : allUnlimited ? 'unlimited' : 'custom'

    ratioEnabled.value = ratio >= 0
    ratioLimit.value = ratio >= 0 ? ratio : 0
    seedingEnabled.value = seeding >= 0
    seedingTimeLimit.value = seeding >= 0 ? seeding : 0
    inactiveEnabled.value = inactive >= 0
    inactiveTimeLimit.value = inactive >= 0 ? inactive : 0
  }
})

function validateCustomInput(): boolean {
  if (ratioEnabled.value && (ratioLimit.value === null || ratioLimit.value < 0)) {
    message.error($t('shareLimitDialog.invalidRatio'))
    return false
  }
  if (seedingEnabled.value && (seedingTimeLimit.value === null || seedingTimeLimit.value < 0)) {
    message.error($t('shareLimitDialog.invalidMinutes'))
    return false
  }
  if (inactiveEnabled.value && (inactiveTimeLimit.value === null || inactiveTimeLimit.value < 0)) {
    message.error($t('shareLimitDialog.invalidMinutes'))
    return false
  }
  return true
}

async function onConfirm() {
  const hashes = targetHashes.value
  if (!hashes.length) {
    message.warning($t('messages.pleaseSelectTask'))
    return
  }

  loading.value = true
  try {
    if (mode.value === 'global') {
      await torrentsApi.setShareLimits(hashes, -2, -2, -2)
    } else if (mode.value === 'unlimited') {
      await torrentsApi.setShareLimits(hashes, -1, -1, -1)
    } else {
      if (!validateCustomInput()) {
        loading.value = false
        return
      }
      const ratioValue = ratioEnabled.value ? (ratioLimit.value ?? 0) : -1
      const seedingValue = seedingEnabled.value ? (seedingTimeLimit.value ?? 0) : -1
      const inactiveValue = inactiveEnabled.value ? (inactiveTimeLimit.value ?? 0) : -1
      await torrentsApi.setShareLimits(hashes, ratioValue, seedingValue, inactiveValue)
    }
    show.value = false
    message.success($t('shareLimitDialog.success'))
    await sleep(500)
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('shareLimitDialog.failed'))
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
.custom-section {
  margin-top: 8px;
  padding: 8px 0 0;
}
.custom-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
