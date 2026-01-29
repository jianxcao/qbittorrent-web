<template>
  <n-menu
    :indent="8"
    :options="categoryMenuOptions"
    v-model:value="torrentStore.categoryFilter"
    v-model:expanded-keys="settingStore.setting.menuExpandedKeys"
    :node-props="nodeProps"
  />
  <CategoryContextMenu ref="contextMenuRef" />
</template>
<script setup lang="ts">
import { useTorrentStore, useSettingStore } from '@/store'
import { renderIcon } from '@/utils'
import { Folder, FolderOpen } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import type { MenuOption } from 'naive-ui'
import CategoryContextMenu from './CategoryContextMenu.vue'

const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const { t: $t } = useI18n()
const contextMenuRef = ref<InstanceType<typeof CategoryContextMenu> | null>(null)

const categoryMenuOptions = computed(() => {
  return [
    {
      label: $t('sidebar.categories'),
      key: 'categories',
      icon: renderIcon(FolderOpen),
      children: torrentStore.categoryOptions.map((item) => ({
        ...item,
        icon: renderIcon(item.icon || Folder)
      }))
    }
  ]
})

const nodeProps = (option: MenuOption): any => {
  return {
    onContextmenu: (e: MouseEvent) => {
      // 右键同时也选中当前项
      torrentStore.categoryFilter = option.key as string
      contextMenuRef.value?.show(e, option.key as string)
    }
  }
}
</script>
