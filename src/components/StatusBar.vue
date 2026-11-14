<template>
  <footer :class="[$style.footer, props.class]">
    <div class="flex items-start gap-1 overflow-hidden flex-1 flex-wrap h-full py-[5px]">
      <n-tag v-for="(item, i) in allTags" :key="i" :type="item.type" size="small">{{ item.text }}</n-tag>
    </div>
    <div class="flex items-center gap-1 flex-shrink-0 h-full" style="width: 96px">
      <n-button
        quaternary
        circle
        size="small"
        @click="onToggleSpeedLimit"
        :title="
          speedLimitMode === 1
            ? $t('statusBar.alternativeSpeedMode')
            : $t('statusBar.normalSpeedMode') + ' - ' + $t('statusBar.toggleSpeedLimit')
        "
        :loading="speedLimitLoading"
        class="flex items-center justify-center"
      >
        <template #icon>
          <n-icon :component="speedLimitMode === 1 ? SpeedometerIcon : SpeedometerOutlineIcon" />
        </template>
      </n-button>
      <n-button
        quaternary
        circle
        size="small"
        @click="onToggleTheme"
        :title="$t('statusBar.toggleTheme')"
        class="flex items-center justify-center"
      >
        <template #icon>
          <n-icon :component="isDark ? MoonIcon : SunIcon" />
        </template>
      </n-button>
      <n-button
        quaternary
        circle
        size="small"
        @click="onShowAbout"
        :title="$t('statusBar.about')"
        class="flex items-center justify-center"
      >
        <template #icon>
          <n-icon :component="InfoIcon" />
        </template>
      </n-button>
    </div>
    <AboutDialog v-model:show="showAbout" />
  </footer>
</template>
<script setup lang="ts">
import AboutDialog from '@/components/dialog/AboutDialog.vue'
import { useSessionStore, useSettingStore, useTorrentStore } from '@/store'
import { getFreeSpaceAtPath } from '@/api/modules/application'
import { formatSize, formatSpeed, compareVersion } from '@/utils'
import {
  InformationCircle as InfoIcon,
  Moon as MoonIcon,
  Sunny as SunIcon,
  Speedometer as SpeedometerIcon,
  SpeedometerOutline as SpeedometerOutlineIcon
} from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  class?: string
}>()

const sessionStore = useSessionStore()
const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const { t: $t } = useI18n()
const message = useMessage()

const serverState = computed(() => torrentStore.serverState)
const torrents = computed(() => torrentStore.torrents)
const totalSize = computed(() => torrents.value.reduce((sum: number, t: any) => sum + (t.size || 0), 0))

const selectedKeys = computed(() => torrentStore.selectedKeys || [])
const selectedSize = computed(() => {
  if (!selectedKeys.value.length) {
    return 0
  }
  return torrents.value
    .filter((t: any) => selectedKeys.value.includes(t.id))
    .reduce((sum: number, t: any) => sum + (t.size || 0), 0)
})

const serverHost = computed(() => settingStore.serverHost)

// 4.x 的 sync 带默认保存路径剩余空间。5.0–5.2 这个字段固定为 -1，且没有替代接口。
// 5.3 / WebAPI 2.15.2 起改为 POST /app/getFreeSpaceAtPath。
const FREE_SPACE_API_VERSION = '2.15.2'
const FREE_SPACE_REMOVED_API_VERSION = '2.11.0'
const FREE_SPACE_REMOVED_APP_VERSION = '5.0.0'
const FREE_SPACE_PATH_APP_VERSION = '5.3.0'
const pathFreeSpace = ref<number | null>(null)

const supportsPathFreeSpace = computed(() => {
  const apiVersion = sessionStore.webApiVersion
  return !!apiVersion && compareVersion(apiVersion, FREE_SPACE_API_VERSION) >= 0
})

// free_space_on_disk 被移除（-1）但还没有 getFreeSpaceAtPath 的版本区间。
// 优先用 WebAPI 版本判断；拿不到时回退到应用版本，避免显示成「未知」。
const isDiskSpaceUnsupported = computed(() => {
  const apiVersion = sessionStore.webApiVersion
  if (apiVersion) {
    return (
      compareVersion(apiVersion, FREE_SPACE_REMOVED_API_VERSION) >= 0 &&
      compareVersion(apiVersion, FREE_SPACE_API_VERSION) < 0
    )
  }
  const appVersion = sessionStore.version
  if (appVersion) {
    return (
      compareVersion(appVersion, FREE_SPACE_REMOVED_APP_VERSION) >= 0 &&
      compareVersion(appVersion, FREE_SPACE_PATH_APP_VERSION) < 0
    )
  }
  return false
})

async function refreshPathFreeSpace() {
  if (!supportsPathFreeSpace.value) {
    pathFreeSpace.value = null
    return
  }
  const path = settingStore.preferences.save_path
  if (!path) {
    pathFreeSpace.value = null
    return
  }
  try {
    pathFreeSpace.value = await getFreeSpaceAtPath(path)
  } catch (error) {
    console.error('Failed to fetch free disk space:', error)
    pathFreeSpace.value = null
  }
}

watch(
  [supportsPathFreeSpace, () => settingStore.preferences.save_path],
  () => {
    refreshPathFreeSpace()
  },
  { immediate: true }
)

// 与种子列表轮询同频，避免加载后剩余空间一直不更新。
const freeSpaceInterval = computed(() => settingStore.setting.polling.torrentInterval * 1000)
const { resume: startFreeSpacePolling, pause: stopFreeSpacePolling } = useIntervalFn(refreshPathFreeSpace, freeSpaceInterval, {
  immediate: false
})

const diskSpaceText = computed(() => {
  if (supportsPathFreeSpace.value) {
    if (pathFreeSpace.value == null) {
      return $t('statusBar.unknown')
    }
    if (pathFreeSpace.value < 0) {
      return $t('statusBar.unknown')
    }
    return formatSize(pathFreeSpace.value)
  }
  const legacy = Number(serverState.value.free_space_on_disk)
  if (Number.isFinite(legacy) && legacy >= 0) {
    return formatSize(legacy)
  }
  if (isDiskSpaceUnsupported.value) {
    return $t('statusBar.diskUnsupported')
  }
  return $t('statusBar.unknown')
})

// 主题切换（naive-ui）
const isDark = computed(() => settingStore.setting.theme === 'dark')
function onToggleTheme() {
  settingStore.setTheme(isDark.value ? 'light' : 'dark')
}

// 关于弹窗（naive-ui n-dialog）
const showAbout = ref(false)
function onShowAbout() {
  showAbout.value = true
}

// 限速模式切换（使用 settingStore 统一管理）
const speedLimitMode = computed(() => settingStore.speedLimitMode)
const speedLimitLoading = ref(false)

// 切换限速模式
async function onToggleSpeedLimit() {
  try {
    speedLimitLoading.value = true
    const newMode = await settingStore.toggleSpeedLimitMode()
    message.success(newMode === 1 ? $t('statusBar.alternativeSpeedMode') : $t('statusBar.normalSpeedMode'))
  } catch (error) {
    console.error('Failed to toggle speed limit mode:', error)
    message.error($t('statusBar.toggleSpeedLimitFailed'))
  } finally {
    speedLimitLoading.value = false
  }
}

// 组件挂载时获取当前限速模式
onMounted(() => {
  settingStore.fetchSpeedLimitMode()
  startFreeSpacePolling()
})

onUnmounted(() => {
  stopFreeSpacePolling()
})

// tag 数据
const allTags = computed(() => [
  { text: $t('statusBar.version', { version: sessionStore.version ?? '--' }), type: 'info' as const },
  { text: $t('statusBar.server', { server: serverHost.value }), type: 'info' as const },
  {
    text: $t('statusBar.upload', {
      rate: formatSpeed(serverState.value.up_info_speed),
      limit: formatSpeed(serverState.value.up_rate_limit)
    }),
    type: 'success' as const
  },
  {
    text: $t('statusBar.download', {
      rate: formatSpeed(serverState.value.dl_info_speed),
      limit: formatSpeed(serverState.value.dl_rate_limit)
    }),
    type: 'info' as const
  },
  {
    text: $t('statusBar.diskSize', {
      size: diskSpaceText.value
    }),
    type: 'info' as const
  },
  { text: $t('statusBar.totalSize', { size: formatSize(totalSize.value) }), type: 'info' as const },
  ...(selectedSize.value > 0
    ? [{ text: $t('statusBar.selectedSize', { size: formatSize(selectedSize.value) }), type: 'info' as const }]
    : [])
])
</script>

<style module lang="less">
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  border-top: 1px solid var(--border-color);
  gap: 16px;
}
</style>
