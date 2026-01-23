<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('deleteDialog.title')"
    @close="onCancel"
    :close-on-esc="true"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">{{ $t('deleteDialog.confirmText') }}</div>
    <div class="mb-2">{{ $t('common.selectedCount', { count: effectiveTorrents.length }) }}</div>
    <n-el class="max-h-[300px] scrollbar px-2 mb-4 border rounded">
      <div v-for="t in effectiveTorrents" :key="t.hash" class="py-1 border-b last:border-0 truncate">
        {{ t.name }}
      </div>
    </n-el>
    <n-checkbox v-model:checked="deleteFiles">{{ $t('deleteDialog.deleteData') }}</n-checkbox>
    <n-checkbox v-if="extraSameRootCount > 0" v-model:checked="deleteSameRootPath">
      {{ $t('deleteDialog.deleteSameRootPath', { count: extraSameRootCount }) }}
    </n-checkbox>

    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="error" @click="onConfirm" :loading="loading">{{ $t('deleteDialog.delete') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useTorrentStore } from '@/store'
import * as torrentsApi from '@/api/modules/torrents'
import { sleep } from '@/utils'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'

const show = defineModel<boolean>('show', { required: true })
const props = defineProps<{
  hashes?: string[]
}>()

const emits = defineEmits<{
  (e: 'success'): void
}>()

const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)
const deleteFiles = ref(false)
const deleteSameRootPath = ref(false)

const targetHashes = computed(() => {
  if (props.hashes && props.hashes.length > 0) {
    return props.hashes
  }
  return torrentStore.selectedKeys
})

const selectedTorrents = computed(() => {
  return torrentStore.torrents.filter((t) => targetHashes.value.includes(t.hash))
})

const rootPathSet = computed(() => {
  const set = new Set<string>()
  selectedTorrents.value.forEach((t) => {
    const rootPath = t.root_path
    if (rootPath) {
      set.add(rootPath)
    }
  })
  return set
})

const sameRootTorrents = computed(() => {
  const rootPaths = rootPathSet.value
  if (rootPaths.size === 0) {
    return selectedTorrents.value
  }
  const seen = new Set<string>()
  return torrentStore.torrents.filter((t) => {
    const rootPath = t.root_path
    if (!rootPath || !rootPaths.has(rootPath)) {
      return false
    }
    if (seen.has(t.hash)) {
      return false
    }
    seen.add(t.hash)
    return true
  })
})

const extraSameRootCount = computed(() => {
  const count = sameRootTorrents.value.length - selectedTorrents.value.length
  return count > 0 ? count : 0
})

const effectiveTorrents = computed(() => {
  if (deleteSameRootPath.value && extraSameRootCount.value > 0) {
    return sameRootTorrents.value
  }
  return selectedTorrents.value
})

const effectiveHashes = computed(() => {
  if (deleteSameRootPath.value && extraSameRootCount.value > 0) {
    return Array.from(new Set(sameRootTorrents.value.map((t) => t.hash)))
  }
  return targetHashes.value
})

async function onConfirm() {
  if (!effectiveHashes.value.length) {
    return
  }

  loading.value = true
  try {
    await torrentsApi.remove(effectiveHashes.value, deleteFiles.value)

    message.success($t('deleteDialog.deleteSuccess'))
    // 如果使用的是选中的 keys，则清空选中状态
    if (!props.hashes || props.hashes.length === 0) {
      torrentStore.clearSelectedKeys()
    }
    show.value = false
    emits('success')
    await sleep(500)
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('deleteDialog.deleteFailed'))
  } finally {
    loading.value = false
  }
}

function onCancel() {
  show.value = false
}

watch(show, (v) => {
  if (v) {
    deleteFiles.value = false
    deleteSameRootPath.value = false
  }
})
</script>

<style scoped lang="less">
@import '@/styles/mix.less';
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.scrollbar {
  overflow-y: auto;
  .scrollbar();
}
</style>
