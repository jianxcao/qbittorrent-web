<template>
  <n-modal v-model:show="show" preset="dialog" :title="$t('torrentDetail.trackers.dialogEditTitle')" @close="onClose">
    <n-form :show-feedback="false">
      <n-form-item :label="$t('torrentDetail.trackers.trackerUrlLabel')">
        <n-input v-model:value="input" type="textarea" :rows="3" clearable />
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
const props = defineProps<{
  originalUrl: string
}>()

const input = ref('')
const message = useMessage()
const { loading, editTracker } = useTrackerOperations()

watch(show, (val) => {
  if (val) {
    input.value = props.originalUrl
  } else {
    input.value = ''
  }
})

function onClose() {
  show.value = false
}

async function onConfirm() {
  const urls = normalizeTrackers(input.value)
  if (urls.length !== 1) {
    message.error(t('torrentDetail.trackers.singleTrackerRequired'))
    return
  }

  const success = await editTracker(props.originalUrl, urls[0])
  if (success) {
    onClose()
  }
}
</script>
