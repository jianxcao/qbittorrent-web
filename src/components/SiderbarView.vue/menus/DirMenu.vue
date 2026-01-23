<template>
  <n-menu
    :indent="8"
    :options="dirMenuOptions"
    v-model:value="torrentStore.downloadDirFilter"
    :default-expand-all="true"
  />
</template>
<script setup lang="ts">
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import { FileTray, Folder } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const dirMenuOptions = computed(() => {
  return [
    {
      label: $t('sidebar.directory'),
      key: 'error',
      icon: renderIcon(FileTray),
      children: torrentStore.downloadDirOptions.map((item) => ({
        ...item,
        icon: renderIcon(item.icon || Folder)
      }))
    }
  ]
})
</script>
