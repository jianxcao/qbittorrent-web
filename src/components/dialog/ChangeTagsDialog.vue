<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('changeLabelsDialog.title')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">{{ $t('common.selectedCount', { count: selectedTorrents.length }) }}</div>
    <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120">
      <n-form-item :label="$t('changeLabelsDialog.labels')">
        <n-select
          v-model:value="tags"
          :options="tagsOptions"
          :placeholder="$t('changeLabelsDialog.labelsPlaceholder')"
          multiple
          clearable
          filterable
          tag
          style="width: 100%"
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
const tags = ref<string[]>([])

const selectedTorrents = computed(() => {
  return torrentStore.torrents.filter((t) => torrentStore.selectedKeys.includes(t.hash))
})

const tagsOptions = computed(() => {
  return torrentStore.allTags.map((tag) => ({
    label: tag,
    value: tag
  }))
})

watch(show, (v) => {
  if (v && selectedTorrents.value.length > 0) {
    // Initialize with the first selected torrent's tags
    tags.value = [...(selectedTorrents.value[0].tagsArray || [])]
  } else {
    tags.value = []
  }
})

async function onConfirm() {
  loading.value = true
  try {
    const hashes = torrentStore.selectedKeys
    const newTags = tags.value

    // 1. Add all new tags
    if (newTags.length > 0) {
      await torrentsApi.addTags(hashes, newTags)
    }

    // 2. Remove tags that are NOT in newTags
    // Collect all unique tags currently present on selected torrents
    const currentTagsSet = new Set<string>()
    selectedTorrents.value.forEach((t) => {
      t.tagsArray?.forEach((tag) => currentTagsSet.add(tag))
    })

    const tagsToRemove = Array.from(currentTagsSet).filter((tag) => !newTags.includes(tag))

    if (tagsToRemove.length > 0) {
      await torrentsApi.removeTags(hashes, tagsToRemove)
    }

    show.value = false
    message.success($t('changeLabelsDialog.changeSuccess'))
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('changeLabelsDialog.changeFailed'))
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
