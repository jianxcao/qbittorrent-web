<template>
  <n-menu
    :indent="8"
    :options="statusMenuOptions"
    v-model:value="torrentStore.statusFilter"
    :default-expand-all="true"
    :node-props="nodeProps"
  />
  <StatusContextMenu ref="contextMenuRef" />
</template>
<script setup lang="ts">
import MagnetIcon from '@/assets/icons/magnet.svg?component'
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import { ShuffleOutline } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import type { MenuOption } from 'naive-ui'
import StatusContextMenu from './StatusContextMenu.vue'

const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const contextMenuRef = ref<InstanceType<typeof StatusContextMenu> | null>(null)

const statusMenuOptions = computed(() => {
  return [
    {
      label: $t('sidebar.status'),
      key: 'status',
      icon: renderIcon(MagnetIcon),
      children: torrentStore.statusOptions.map((item) => ({
        ...item,
        icon: renderIcon(item.icon || ShuffleOutline, item.color)
      }))
    }
  ]
})

const nodeProps = (option: MenuOption): any => {
  return {
    onContextmenu: (e: MouseEvent) => {
      // 只有具体的子状态项才显示右键菜单，'status' 父节点不显示
      if (option.key !== 'status') {
        // 右键同时也选中当前项
        torrentStore.statusFilter = option.key as string
        contextMenuRef.value?.show(e, option.key as string)
      }
    }
  }
}
</script>
