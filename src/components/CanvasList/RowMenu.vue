<template>
  <n-dropdown
    v-model:show="show"
    trigger="manual"
    :x="x"
    :y="y"
    :options="dropdownOptions"
    @select="onDropdownSelect"
    class="row-drop-down-menus"
    :class="$style['row-drop-down-menus']"
    :to="to"
    :z-index="1000"
    :animated="false"
    :style="{ maxHeight: maxHeight, maxWidth: '60dvw' }"
    scrollable
  />
  <DeleteTorrentDialog v-model:show="showDeleteDialog" :hashes="targetHashes" />
  <ChangeLocationDialog v-model:show="showChangeLocationDialog" />
  <ChangeTagsDialog v-model:show="showChangeTagsDialog" />
  <ChangeCategoryDialog v-model:show="showChangeCategoryDialog" />
  <EditTrackerDialog v-model:show="showEditTrackerDialog" />
  <RenameTorrentDialog v-model:show="showRenameDialog" />
  <RenameFolderDialog v-model:show="showRenameFolderDialog" />
  <LimitSpeedDialog v-model:show="showLimitDownloadDialog" type="download" :hashes="targetHashes" />
  <LimitSpeedDialog v-model:show="showLimitUploadDialog" type="upload" :hashes="targetHashes" />
  <ShareLimitDialog v-model:show="showShareLimitDialog" :hashes="targetHashes" />
</template>

<script setup lang="ts">
import * as torrentsApi from '@/api/modules/torrents'
import ChangeCategoryDialog from '@/components/dialog/ChangeCategoryDialog.vue'
import ChangeLocationDialog from '@/components/dialog/ChangeLocationDialog.vue'
import ChangeTagsDialog from '@/components/dialog/ChangeTagsDialog.vue'
import DeleteTorrentDialog from '@/components/dialog/DeleteTorrentDialog.vue'
import EditTrackerDialog from '@/components/dialog/EditTrackerDialog.vue'
import LimitSpeedDialog from '@/components/dialog/LimitSpeedDialog.vue'
import RenameFolderDialog from '@/components/dialog/RenameFolderDialog.vue'
import RenameTorrentDialog from '@/components/dialog/RenameTorrentDialog.vue'
import ShareLimitDialog from '@/components/dialog/ShareLimitDialog.vue'
import { useTorrentStore } from '@/store'
import { copyToClipboard, renderIcon, sleep } from '@/utils/index'
import { useMessage, useThemeVars } from 'naive-ui'

import ArrowDownIcon from '@/assets/icons/arrowDown.svg?component'
import ArrowUpIcon from '@/assets/icons/arrowUp.svg?component'
import DismissSquareIcon from '@/assets/icons/dismissSquare.svg?component'
import DoubleArrowDownIcon from '@/assets/icons/doubleArrowDown.svg?component'
import DoubleArrowUpIcon from '@/assets/icons/doubleArrowUp.svg?component'
import FolderCopyIcon from '@/assets/icons/folderCopy.svg?component'
import {
  CaretForwardCircle,
  CloudDownloadOutline,
  CloudUploadOutline,
  CopySharp,
  CreateOutline,
  DownloadOutline,
  FlashSharp,
  FolderOpenSharp,
  MagnetSharp,
  PauseCircle,
  Pricetags,
  RefreshCircle,
  ShareSocialOutline,
  StarSharp
} from '@vicons/ionicons5'
import AnyTouchCore from 'any-touch'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const at = new AnyTouchCore(document.body, {
  preventDefault: false
})
at.use(AnyTouchCore.tap)

const theme = useThemeVars()
const torrentStore = useTorrentStore()
const { t } = useI18n()
const props = defineProps<{
  x: number
  y: number
  to?: string | HTMLElement
  hash?: string // Current row hash
}>()
const show = defineModel<boolean>('show')
const maxHeight = ref('auto')
const message = useMessage()

// Dialog states
const showDeleteDialog = ref(false)
const showChangeLocationDialog = ref(false)
const showChangeTagsDialog = ref(false)
const showChangeCategoryDialog = ref(false)
const showEditTrackerDialog = ref(false)
const showRenameDialog = ref(false)
const showRenameFolderDialog = ref(false)
const showLimitDownloadDialog = ref(false)
const showLimitUploadDialog = ref(false)
const showShareLimitDialog = ref(false)

const targetHashes = computed(() => {
  // Logic:
  // If no hash provided (shouldn't happen for row menu), return empty
  // If hash provided and it's in selectedKeys, return all selectedKeys (batch op)
  // If hash provided and NOT in selectedKeys, return just this hash (single op)
  if (!props.hash) {
    return []
  }
  if (torrentStore.selectedKeys.includes(props.hash)) {
    return torrentStore.selectedKeys
  }
  return [props.hash]
})

const dropdownOptions = computed(() => {
  const isMultiple = targetHashes.value.length > 1

  return [
    { label: t('rowMenu.forceStart'), key: 'forceStart', icon: renderIcon(FlashSharp, theme.value.primaryColor) },
    { label: t('rowMenu.start'), key: 'start', icon: renderIcon(CaretForwardCircle, theme.value.primaryColor) },
    { label: t('rowMenu.stop'), key: 'stop', icon: renderIcon(PauseCircle, theme.value.primaryColor) },
    { label: t('rowMenu.verify'), key: 'verify', icon: renderIcon(RefreshCircle, theme.value.primaryColor) },
    { label: t('rowMenu.remove'), key: 'remove', icon: renderIcon(DismissSquareIcon, theme.value.errorColor) },
    {
      type: 'divider',
      key: 'd1'
    },
    { label: t('rowMenu.reannounce'), key: 'reannounce', icon: renderIcon(RefreshCircle, theme.value.primaryColor) },
    { label: t('rowMenu.changeDir'), key: 'changeDir', icon: renderIcon(FolderOpenSharp, theme.value.primaryColor) },
    {
      label: t('common.rename'),
      key: 'rename',
      icon: renderIcon(CreateOutline, theme.value.primaryColor),
      disabled: isMultiple
    },
    {
      label: t('rowMenu.renameFolder'),
      key: 'renameFolder',
      icon: renderIcon(CreateOutline, theme.value.primaryColor),
      disabled: isMultiple
    },
    {
      label: t('rowMenu.changeCategory'),
      key: 'changeCategory',
      icon: renderIcon(FolderOpenSharp, theme.value.primaryColor)
    },
    { label: t('rowMenu.changeLabel'), key: 'changeLabel', icon: renderIcon(Pricetags, theme.value.primaryColor) },
    { label: t('rowMenu.editTracker'), key: 'editTracker', icon: renderIcon(CreateOutline, theme.value.primaryColor) },
    {
      type: 'divider',
      key: 'd2'
    },
    {
      label: t('rowMenu.limitDownload'),
      key: 'limitDownload',
      icon: renderIcon(CloudDownloadOutline, theme.value.primaryColor)
    },
    {
      label: t('rowMenu.limitUpload'),
      key: 'limitUpload',
      icon: renderIcon(CloudUploadOutline, theme.value.primaryColor)
    },
    {
      label: t('rowMenu.limitShare'),
      key: 'limitShare',
      icon: renderIcon(ShareSocialOutline, theme.value.primaryColor)
    },
    {
      type: 'divider',
      key: 'd3'
    },
    { label: t('rowMenu.copyName'), key: 'copyName', icon: renderIcon(CopySharp, theme.value.primaryColor) },
    { label: t('rowMenu.copyPath'), key: 'copyPath', icon: renderIcon(FolderCopyIcon, theme.value.primaryColor) },
    { label: t('rowMenu.copyMagnet'), key: 'copyMagnet', icon: renderIcon(MagnetSharp, theme.value.primaryColor) },
    {
      label: t('rowMenu.exportTorrent'),
      key: 'exportTorrent',
      icon: renderIcon(DownloadOutline, theme.value.primaryColor),
      disabled: isMultiple
    },
    {
      type: 'divider',
      key: 'd4'
    },
    {
      label: t('rowMenu.queue'),
      key: 'queue',
      icon: renderIcon(StarSharp, theme.value.primaryColor),
      children: [
        {
          label: t('rowMenu.moveTop'),
          key: 'moveTop',
          icon: renderIcon(DoubleArrowUpIcon, theme.value.infoColor)
        },
        {
          label: t('rowMenu.moveUp'),
          key: 'moveUp',
          icon: renderIcon(ArrowUpIcon, theme.value.infoColor)
        },
        {
          label: t('rowMenu.moveDown'),
          key: 'moveDown',
          icon: renderIcon(ArrowDownIcon, theme.value.infoColor)
        },
        {
          label: t('rowMenu.moveBottom'),
          key: 'moveBottom',
          icon: renderIcon(DoubleArrowDownIcon, theme.value.infoColor)
        }
      ]
    }
  ]
})

watch(
  () => props.y,
  (y) => {
    // Only calculate if show is true or about to show, but usually handled by v-model
    const clientHeight = document.documentElement.clientHeight
    const m = clientHeight - y
    let d = 20
    // Try to approximate safe area if settingStore doesn't have it explicitly or use defaults
    // Assuming settingStore has safeArea which might be mobile specific
    // For now use hardcoded safety
    if (y > m) {
      d = 20
    } else {
      d = 20
    }
    maxHeight.value = `${m > y ? m - d : y - d}px`
  }
)

const closeDropdown = (e: any) => {
  if (e.target instanceof HTMLElement && e.target.closest('.row-drop-down-menus')) {
    return
  }
  show.value = false
}
watch(show, (value) => {
  if (value) {
    setTimeout(() => {
      at.on('tap', closeDropdown)
    }, 16)
  } else {
    at.off('tap', closeDropdown)
  }
})

async function onDropdownSelect(key: string) {
  const ids = targetHashes.value
  if (!ids || ids.length === 0) {
    message.warning(t('messages.pleaseSelectTask'))
    return
  }

  // Handle single selection for rename (dialog handles it but we should probably ensure single selection if logic requires)
  if (key === 'rename' && ids.length > 1) {
    message.warning(t('messages.renameSingleOnly')) // Need to add translation or use generic
    return
  }

  // If user clicked on a row that was NOT selected, we should probably select it?
  // But usually context menu action applies to the clicked item(s).
  // If clicked item is not in selection, usually selection changes to just that item.
  // But here we just operate on it.

  // If operating on unselected item, maybe we should select it?
  if (props.hash && !torrentStore.selectedKeys.includes(props.hash)) {
    torrentStore.setSelectedKeys([props.hash])
  }

  switch (key) {
    case 'start':
      await torrentsApi.resume(ids)
      message.success(t('messages.taskStarted'))
      break
    case 'forceStart':
      await torrentsApi.setForceStart(ids, true)
      message.success(t('messages.taskForceStarted'))
      break
    case 'stop':
      await torrentsApi.pause(ids)
      message.success(t('messages.taskPaused'))
      break
    case 'verify':
      await torrentsApi.recheck(ids)
      message.success(t('messages.taskVerified'))
      break
    case 'remove':
      showDeleteDialog.value = true
      break
    case 'copyName': {
      const names = ids.map((id) => torrentStore.torrents.find((t) => t.hash === id)?.name).join('\n')
      const nameSuccess = await copyToClipboard(names)
      if (nameSuccess) {
        message.success(t('messages.nameCopied'))
      } else {
        message.error(t('messages.copyFailed'))
      }
      break
    }
    case 'copyPath': {
      const paths = ids
        .map((id) => {
          const t = torrentStore.torrents.find((t) => t.hash === id)
          // ensurePathDelimiter might need to be imported or implemented
          // Assuming t.downloadDir + t.name is roughly correct but depends on content layout
          return t ? `${t.save_path}${t.name}` : ''
        })
        .join('\n')
      const pathSuccess = await copyToClipboard(paths)
      if (pathSuccess) {
        message.success(t('messages.pathCopied'))
      } else {
        message.error(t('messages.copyFailed'))
      }
      break
    }
    case 'copyMagnet': {
      const magnets = ids.map((id) => torrentStore.torrents.find((t) => t.hash === id)?.magnet_uri).join('\n')
      const magnetSuccess = await copyToClipboard(magnets)
      if (magnetSuccess) {
        message.success(t('messages.magnetCopied'))
      } else {
        message.error(t('messages.copyFailed'))
      }
      break
    }
    case 'exportTorrent': {
      if (ids.length > 0) {
        const url = torrentsApi.getExportUrl(ids[0])
        window.open(url, '_blank')
      }
      break
    }
    case 'reannounce':
      await torrentsApi.reannounce(ids)
      message.success(t('messages.reannounced'))
      break
    case 'changeDir':
      showChangeLocationDialog.value = true
      break
    case 'rename':
      showRenameDialog.value = true
      break
    case 'renameFolder':
      showRenameFolderDialog.value = true
      break
    case 'changeCategory':
      showChangeCategoryDialog.value = true
      break
    case 'changeLabel':
      showChangeTagsDialog.value = true
      break
    case 'editTracker':
      showEditTrackerDialog.value = true
      break
    case 'limitDownload':
      showLimitDownloadDialog.value = true
      break
    case 'limitUpload':
      showLimitUploadDialog.value = true
      break
    case 'limitShare':
      showShareLimitDialog.value = true
      break
    case 'moveTop':
      await torrentsApi.setTopPriority(ids)
      message.success(t('messages.movedToTop'))
      break
    case 'moveUp':
      await torrentsApi.increasePriority(ids)
      message.success(t('messages.movedUp'))
      break
    case 'moveDown':
      await torrentsApi.decreasePriority(ids)
      message.success(t('messages.movedDown'))
      break
    case 'moveBottom':
      await torrentsApi.setBottomPriority(ids)
      message.success(t('messages.movedToBottom'))
      break
  }

  // Refresh data
  // We can just let the polling handle it, or force fetch.
  // API calls usually don't return new state immediately.
  await sleep(500)
  torrentStore.fetchTorrents()
  show.value = false
}
</script>

<style lang="less" module>
.row-drop-down-menus {
  :global {
    .n-scrollbar-container {
      .n-scrollbar-content {
        min-width: fit-content;
        .n-dropdown-divider {
          width: 100%;
          min-width: fit-content;
        }
        .n-dropdown-option {
          min-width: fit-content;
        }
      }
    }
  }
}
</style>
