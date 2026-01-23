<template>
  <div class="h-full flex items-center justify-between flex-1">
    <!-- 左侧按钮分组 -->
    <div class="flex items-center gap-4 hidden md:flex">
      <!-- 组1：添加磁力链接、添加种子 -->
      <div class="group-item">
        <IconButton :icon="Magnet" :tooltip="$t('common.addMagnet')" @click="onAddMagnet" :color="theme.primaryColor" />
        <IconButton
          :icon="AddCircle"
          :tooltip="$t('common.addTorrent')"
          @click="onAddTorrent"
          :color="theme.primaryColor"
        />
      </div>
      <!-- 组2：开始、暂停、删除 -->
      <div class="group-item">
        <IconButton
          :icon="CaretForwardCircle"
          :tooltip="$t('common.startTasks')"
          @click="onStart"
          :disabled="!torrentStore.selectedKeys.length"
          :color="theme.successColor"
        />
        <IconButton
          :icon="PauseCircle"
          :tooltip="$t('common.pauseTasks')"
          @click="onPause"
          :disabled="!torrentStore.selectedKeys.length"
          :color="theme.warningColor"
        />
        <IconButton
          :icon="DismissSquareIcon"
          :tooltip="$t('common.deleteTasks')"
          @click="onRemove"
          :color="theme.errorColor"
          :disabled="!torrentStore.selectedKeys.length"
        />
      </div>
      <!-- 组3：上移、下移、修改目录、标签、优先级（用 slot 传递占位图标） -->
      <div class="group-item">
        <IconButton
          :tooltip="$t('common.moveTop')"
          @click="onMoveTop"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="DoubleArrowUp"
          :color="theme.infoColor"
        />
        <IconButton
          :tooltip="$t('common.moveUp')"
          @click="onMoveUp"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="ArrowUpCircleSharp"
          :color="theme.infoColor"
        />
        <IconButton
          :tooltip="$t('common.moveDown')"
          @click="onMoveDown"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="ArrowDownCircleSharp"
          :color="theme.infoColor"
        />
        <IconButton
          :tooltip="$t('common.moveBottom')"
          @click="onMoveBottom"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="DoubleArrowDown"
          :color="theme.infoColor"
        />
      </div>
      <div class="group-item">
        <IconButton
          :tooltip="$t('common.changeDirectory')"
          @click="onChangeDir"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="FolderOpenSharp"
          :color="theme.warningColor"
        />
        <IconButton
          :tooltip="$t('common.changeCategory')"
          @click="onChangeCategory"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="Folder"
          :color="theme.primaryColor"
        />
        <IconButton
          :tooltip="$t('common.changeLabels')"
          @click="onChangeLabel"
          :disabled="!torrentStore.selectedKeys.length"
          :icon="Pricetags"
          :color="theme.infoColor"
        />
      </div>
    </div>
    <!-- 种子操作下拉菜单：md及以下显示 -->
    <div class="md:hidden">
      <MobileActionDropdown
        v-model:search="torrentStore.search"
        :selected-keys="torrentStore.selectedKeys"
        @action="onMobileActionSelect"
      />
    </div>
    <div class="flex-1 mx-2">
      <!-- 搜索框 -->
      <n-input
        v-model:value="torrentStore.search"
        :placeholder="$t('common.searchPlaceholder')"
        class="max-w-[600px]"
        clearable
      />
    </div>
    <!-- 右侧设置按钮 -->
    <div class="flex items-center gap-2">
      <LanguageSwitcher />
      <IconButton
        :tooltip="$t('common.settings')"
        @click="onSetting"
        :icon="SettingsSharp"
        :color="theme.primaryColor"
      />
      <IconButton
        v-if="!isMobile"
        :tooltip="$t('common.details')"
        @click="onLayoutBottom"
        :icon="LayoutBottom"
        :color="theme.primaryColor"
      />
    </div>
    <AddDialog v-model:show="showAddMagnetDialog" :type="addDialogType" />
    <DeleteTorrentDialog v-model:show="showDeleteDialog" />
    <ChangeLocationDialog v-model:show="showChangeDirDialog" />
    <ChangeTagsDialog v-model:show="showChangeLabelDialog" />
    <ChangeCategoryDialog v-model:show="showChangeCategoryDialog" />
    <SettingsDialog v-model:show="showSettingsDialog" />
  </div>
</template>
<script setup lang="ts">
import * as torrentsApi from '@/api/modules/torrents'
import DismissSquareIcon from '@/assets/icons/dismissSquare.svg?component'
import DoubleArrowUp from '@/assets/icons/doubleArrowUp.svg?component'
import DoubleArrowDown from '@/assets/icons/doubleArrowDown.svg?component'
import LayoutBottom from '@/assets/icons/layoutBottom.svg?component'
import AddDialog from '@/components/dialog/AddDialog.vue'
import ChangeCategoryDialog from '@/components/dialog/ChangeCategoryDialog.vue'
import ChangeLocationDialog from '@/components/dialog/ChangeLocationDialog.vue'
import ChangeTagsDialog from '@/components/dialog/ChangeTagsDialog.vue'
import DeleteTorrentDialog from '@/components/dialog/DeleteTorrentDialog.vue'
import SettingsDialog from '@/components/dialog/SettingsDialog.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useTorrentStore } from '@/store'
import {
  AddCircle,
  ArrowDownCircleSharp,
  ArrowUpCircleSharp,
  CaretForwardCircle,
  Folder,
  FolderOpenSharp,
  Magnet,
  PauseCircle,
  Pricetags,
  SettingsSharp
} from '@vicons/ionicons5'
import { useMessage, useThemeVars } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const emit = defineEmits(['layoutBottom'])
const torrentStore = useTorrentStore()
const theme = useThemeVars()
const message = useMessage()
const { t: $t } = useI18n()
const router = useRouter()
const addDialogType = ref<'file' | 'magnet'>('file')
const showDeleteDialog = ref(false)
const showAddMagnetDialog = ref(false)
const showChangeDirDialog = ref(false)
const showChangeLabelDialog = ref(false)
const showChangeCategoryDialog = ref(false)
const showSettingsDialog = ref(false)
const isMobile = useIsSmallScreen()

const onAddMagnet = () => {
  addDialogType.value = 'magnet'
  showAddMagnetDialog.value = true
}

const onAddTorrent = () => {
  addDialogType.value = 'file'
  showAddMagnetDialog.value = true
}

const onStart = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.resume(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskStarted'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskStartFailed'))
  }
}

const onPause = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.pause(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskPaused'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskPauseFailed'))
  }
}

const onRemove = () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  showDeleteDialog.value = true
}

const onMoveUp = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.increasePriority(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskMovedUp'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskMoveUpFailed'))
  }
}

const onMoveTop = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.setTopPriority(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskMovedTop'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskMoveTopFailed'))
  }
}

const onMoveDown = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.decreasePriority(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskMovedDown'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskMoveDownFailed'))
  }
}

const onMoveBottom = async () => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    await torrentsApi.setBottomPriority(torrentStore.selectedKeys)
    await torrentStore.fetchTorrents()
    message.success($t('message.taskMovedBottom'))
  } catch (error) {
    console.error(error)
    message.error($t('message.taskMoveBottomFailed'))
  }
}

const onChangeDir = () => {
  showChangeDirDialog.value = true
}

const onChangeCategory = () => {
  showChangeCategoryDialog.value = true
}

const onChangeLabel = () => {
  showChangeLabelDialog.value = true
}

const onSelectPriority = async (priority: number) => {
  if (!torrentStore.selectedKeys.length) {
    return
  }
  try {
    // qBittorrent API 不支持直接设置优先级数值
    // 根据优先级值调用相应的 API
    if (priority === 1) {
      // 高优先级 -> 设置为最高优先级
      await torrentsApi.setTopPriority(torrentStore.selectedKeys)
    } else if (priority === -1) {
      // 低优先级 -> 设置为最低优先级
      await torrentsApi.setBottomPriority(torrentStore.selectedKeys)
    }
    // priority === 0 时不执行任何操作,因为无法直接设置为"普通"优先级

    message.success($t('message.priorityChanged'))
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('message.priorityChangeFailed'))
  }
}

const onSetting = () => {
  if (isMobile.value) {
    // 移动端跳转到设置页面
    router.push('/settings')
  } else {
    // PC端显示设置弹窗
    showSettingsDialog.value = true
  }
}

const onLayoutBottom = () => {
  emit('layoutBottom')
}

const onMobileActionSelect = async (key: string) => {
  switch (key) {
    case 'addMagnet':
      onAddMagnet()
      break
    case 'addTorrent':
      onAddTorrent()
      break
    case 'start':
      await onStart()
      break
    case 'pause':
      await onPause()
      break
    case 'remove':
      onRemove()
      break
    case 'moveUp':
      await onMoveUp()
      break
    case 'moveTop':
      await onMoveTop()
      break
    case 'moveDown':
      await onMoveDown()
      break
    case 'moveBottom':
      await onMoveBottom()
      break
    case 'changeDir':
      onChangeDir()
      break
    case 'changeCategory':
      onChangeCategory()
      break
    case 'changeLabel':
      onChangeLabel()
      break
    case 'priority1':
      await onSelectPriority(1)
      break
    case 'priority0':
      await onSelectPriority(0)
      break
    case 'priority-1':
      await onSelectPriority(-1)
      break
  }
}
</script>

<script lang="ts">
export default {
  name: 'AppHeader'
}
</script>

<style lang="less" scoped>
.group-item {
  gap: 6px;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--border-color);

  &:first-child {
    border-left: none;
  }
}
</style>
