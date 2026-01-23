<template>
  <n-modal v-model:show="show" preset="dialog" :title="$t('torrentDetail.trackers.dialogDeleteTitle')" @close="onClose">
    <div>
      <template v-if="trackerUrls.length === 1">
        {{ $t('torrentDetail.trackers.deleteConfirmSingle') }}
      </template>
      <template v-else>
        {{ $t('torrentDetail.trackers.deleteConfirmMultiple', { count: trackerUrls.length }) }}
      </template>
    </div>
    <template #action>
      <n-button @click="onClose">{{ $t('common.cancel') }}</n-button>
      <n-button type="error" @click="onConfirm" :loading="loading">{{ $t('sidebar.delete') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useTrackerOperations } from './useTrackerOperations'

const show = defineModel<boolean>('show', { required: true })
const props = defineProps<{
  trackerUrls: string[]
}>()

const { loading, removeTrackers } = useTrackerOperations()

function onClose() {
  show.value = false
}

async function onConfirm() {
  const success = await removeTrackers(props.trackerUrls)
  if (success) {
    onClose()
  }
}
</script>
