<template>
  <n-modal v-model:show="show" preset="dialog" :title="$t('torrentDetail.trackers.dialogAddTitle')" @close="onClose">
    <n-form :show-feedback="false">
      <n-form-item :label="$t('torrentDetail.trackers.trackerUrlLabel')">
        <n-input
          v-model:value="input"
          type="textarea"
          :rows="4"
          :placeholder="$t('torrentDetail.trackers.trackerUrlPlaceholder')"
          clearable
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="onClose">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading">{{ $t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { normalizeTrackers, useTrackerOperations } from './useTrackerOperations'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
const show = defineModel<boolean>('show', { required: true })
const input = ref('')
const message = useMessage()
const { loading, addTrackers } = useTrackerOperations()

watch(show, (val) => {
  if (!val) {
    input.value = ''
  }
})

function onClose() {
  show.value = false
}

async function onConfirm() {
  const urls = normalizeTrackers(input.value)
  if (urls.length === 0) {
    message.error(t('torrentDetail.trackers.trackerUrlRequired'))
    return
  }

  const success = await addTrackers(urls)
  if (success) {
    onClose()
  }
}
</script>
