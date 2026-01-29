<template>
  <n-menu
    :indent="8"
    :options="tagMenuOptions"
    v-model:value="torrentStore.tagsFilter"
    v-model:expanded-keys="settingStore.setting.menuExpandedKeys"
    :node-props="nodeProps"
  />
  <TagContextMenu ref="contextMenuRef" />
</template>
<script setup lang="ts">
import { useTorrentStore, useSettingStore } from '@/store'
import { renderIcon } from '@/utils'
import { Pricetag, Pricetags } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import type { MenuOption } from 'naive-ui'
import TagContextMenu from './TagContextMenu.vue'

const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const { t: $t } = useI18n()

const contextMenuRef = ref<InstanceType<typeof TagContextMenu> | null>(null)

const tagMenuOptions = computed(() => {
  return [
    {
      label: $t('sidebar.tags'),
      key: 'tags',
      icon: renderIcon(Pricetags),
      children: torrentStore.tagsOptions.map((item) => ({
        ...item,
        icon: renderIcon(item.icon || Pricetag)
      }))
    }
  ]
})

const nodeProps = (option: MenuOption): any => {
  return {
    onContextmenu: (e: MouseEvent) => {
      // 右键同时也选中当前项
      torrentStore.tagsFilter = option.key as string
      contextMenuRef.value?.show(e, option.key as string)
    }
  }
}
</script>
