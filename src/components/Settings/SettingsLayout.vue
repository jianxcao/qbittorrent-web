<template>
  <div class="settings">
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>
    <template v-else>
      <div class="tabs-container">
        <n-tabs v-model:value="activeTabValue" type="line" animated class="tabs">
          <n-tab-pane name="behavior" :tab="$t('settings.tabs.behavior')">
            <BehaviorSettings />
          </n-tab-pane>
          <n-tab-pane name="downloads" :tab="$t('settings.tabs.downloads')">
            <DownloadsSettings />
          </n-tab-pane>
          <n-tab-pane name="connection" :tab="$t('settings.tabs.connection')">
            <ConnectionSettings />
          </n-tab-pane>
          <n-tab-pane name="speed" :tab="$t('settings.tabs.speed')">
            <SpeedSettings />
          </n-tab-pane>
          <n-tab-pane name="bittorrent" :tab="$t('settings.tabs.bittorrent')">
            <BitTorrentSettings />
          </n-tab-pane>
          <n-tab-pane name="webui" :tab="$t('settings.tabs.webui')">
            <WebUISettings />
          </n-tab-pane>
          <n-tab-pane name="tags-categories" :tab="$t('settings.tabs.tagsCategories')">
            <TagsAndCategories />
          </n-tab-pane>
          <n-tab-pane name="advanced" :tab="$t('settings.tabs.advanced')">
            <AdvancedSettings />
          </n-tab-pane>
        </n-tabs>
      </div>
      <div class="actions">
        <n-space justify="end">
          <n-button @click="onCancel">{{ $t('common.cancel') }}</n-button>
          <n-button type="primary" @click="onSave" :loading="saving">{{ $t('common.save') }}</n-button>
        </n-space>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'

interface Props {
  activeTab?: string
  tabsClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeTab: 'behavior'
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t: $t } = useI18n()
const settingStore = useSettingStore()
const message = useMessage()
const loading = ref(true)
const saving = ref(false)
const activeTabValue = ref(props.activeTab)

// 监听 activeTab prop 变化
watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab) {
      activeTabValue.value = newTab
    }
  }
)

// 在组件加载时重新获取 preferences
onMounted(async () => {
  try {
    loading.value = true
    await settingStore.fetchPreferences()
  } catch (error) {
    console.error('Failed to load preferences:', error)
    message.error($t('settings.loadFailed'))
  } finally {
    loading.value = false
  }
})

async function onSave() {
  try {
    saving.value = true
    await settingStore.setPreferences(settingStore.preferences)
    await settingStore.fetchPreferences()
    message.success($t('settings.saveSuccess'))
    emit('saved')
  } catch (error) {
    console.error('Failed to save settings:', error)
    message.error($t('settings.saveFailed'))
  } finally {
    saving.value = false
  }
}

function onCancel() {
  emit('close')
}
</script>

<style scoped lang="less">
@import '@/styles/mix.less';
.settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.tabs-container {
  flex: 1;
  padding-right: 16px;
  overflow: hidden;
  box-sizing: border-box;
  .tabs {
    height: 100%;
  }
  :deep(.n-tabs-nav) {
    padding: 2px 0;
    position: sticky;
    top: 0;
    z-index: 2;
    padding-inline: 16px !important;
    border-bottom: 1px solid var(--border-color);
    .n-tabs-nav-scroll-content {
      border-bottom-width: 0px !important;
    }
    .n-tabs-pane-wrapper {
      flex: 0 0 auto;
      overflow: hidden;
    }
  }
  :deep(.n-tab-pane) {
    height: 100%;
    overflow: auto;
    .scrollbar();
    padding-inline: 16px !important;
  }
}

.actions {
  padding: 16px 20px;
  padding-bottom: 0;
}
</style>
