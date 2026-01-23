<template>
  <n-dropdown trigger="click" :options="mobileActionOptions" @select="onSelect" :animated="false">
    <n-button quaternary circle>
      <n-icon :component="MenuSharp" size="24" />
    </n-button>
  </n-dropdown>
</template>
<script setup lang="ts">
import DismissSquareIcon from '@/assets/icons/dismissSquare.svg?component'
import DoubleArrowUp from '@/assets/icons/doubleArrowUp.svg?component'
import DoubleArrowDown from '@/assets/icons/doubleArrowDown.svg?component'
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import {
  AddCircle,
  ArrowDownCircleSharp,
  ArrowUpCircleSharp,
  CaretForwardCircle,
  Folder,
  FolderOpenSharp,
  Magnet,
  MenuSharp,
  PauseCircle,
  Pricetags
} from '@vicons/ionicons5'
import { useThemeVars } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const theme = useThemeVars()
const emit = defineEmits(['action'])
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()

const isOk = computed(() => torrentStore.selectedKeys.length > 0)

const mobileActionOptions = computed(() => [
  {
    label: $t('common.addMagnet'),
    key: 'addMagnet',
    icon: renderIcon(Magnet, theme.value.primaryColor)
  },
  {
    label: $t('common.addTorrent'),
    key: 'addTorrent',
    icon: renderIcon(AddCircle, theme.value.primaryColor)
  },
  {
    label: $t('common.startTasks'),
    key: 'start',
    disabled: !isOk.value,
    icon: renderIcon(CaretForwardCircle, theme.value.primaryColor)
  },
  {
    label: $t('common.pauseTasks'),
    key: 'pause',
    disabled: !isOk.value,
    icon: renderIcon(PauseCircle, theme.value.primaryColor)
  },
  {
    label: $t('common.deleteTasks'),
    key: 'remove',
    disabled: !isOk.value,
    icon: renderIcon(DismissSquareIcon, theme.value.errorColor)
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: $t('common.moveTop'),
    key: 'moveTop',
    disabled: !isOk.value,
    icon: renderIcon(DoubleArrowUp, theme.value.infoColor)
  },
  {
    label: $t('common.moveUp'),
    key: 'moveUp',
    disabled: !isOk.value,
    icon: renderIcon(ArrowUpCircleSharp, theme.value.infoColor)
  },
  {
    label: $t('common.moveDown'),
    key: 'moveDown',
    disabled: !isOk.value,
    icon: renderIcon(ArrowDownCircleSharp, theme.value.infoColor)
  },
  {
    label: $t('common.moveBottom'),
    key: 'moveBottom',
    disabled: !isOk.value,
    icon: renderIcon(DoubleArrowDown, theme.value.infoColor)
  },
  {
    type: 'divider',
    key: 'd2'
  },
  {
    label: $t('common.changeDirectory'),
    key: 'changeDir',
    disabled: !isOk.value,
    icon: renderIcon(FolderOpenSharp, theme.value.warningColor)
  },
  {
    label: $t('common.changeCategory'),
    key: 'changeCategory',
    disabled: !isOk.value,
    icon: renderIcon(Folder, theme.value.primaryColor)
  },
  {
    label: $t('common.changeLabels'),
    key: 'changeLabel',
    disabled: !isOk.value,
    icon: renderIcon(Pricetags, theme.value.infoColor)
  }
])

function onSelect(key: string) {
  emit('action', key)
}
</script>
