<template>
  <div :class="$style.settings">
    <div :class="$style.tabsContainer">
      <n-tabs
        v-model:value="activeTabValue"
        type="line"
        :placement="isMobile ? 'top' : 'left'"
        :tab-style="tabStyle"
        animated
      >
        <n-tab-pane name="behavior" :tab="$t('settings.tabs.behavior')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <Behavior />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="downloads" :tab="$t('settings.tabs.downloads')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <Downloads />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="connection" :tab="$t('settings.tabs.connection')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <Connection />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="speed" :tab="$t('settings.tabs.speed')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <Speed />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="bittorrent" :tab="$t('settings.tabs.bittorrent')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <BitTorrent />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="webui" :tab="$t('settings.tabs.webui')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <WebUI />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="tags-categories" :tab="$t('settings.tabs.tagsCategories')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <TagsAndCategories />
            </div>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="advanced" :tab="$t('settings.tabs.advanced')">
          <n-scrollbar :style="scrollbarStyle">
            <div :class="$style.tabContent">
              <Advanced />
            </div>
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>
    </div>

    <n-divider :class="$style.divider" />

    <div :class="$style.actions">
      <n-space justify="end">
        <n-button @click="onCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="onSave" :loading="saving">{{ $t('common.save') }}</n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
interface Props {
  activeTab?: string
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
const isMobile = useIsSmallScreen()
const saving = ref(false)
const activeTabValue = ref(props.activeTab)

const tabStyle = computed(() => {
  if (isMobile.value) {
    return { minWidth: '80px' }
  }
  return { minWidth: '120px' }
})

const scrollbarStyle = computed(() => {
  if (isMobile.value) {
    return { maxHeight: 'calc(100vh - 250px)' }
  }
  return { maxHeight: 'calc(85vh - 120px)' }
})

// 监听 activeTab prop 变化
watch(
  () => props.activeTab,
  (newTab) => {
    if (newTab) {
      activeTabValue.value = newTab
    }
  }
)

// 在组件加载时获取 preferences
onMounted(async () => {
  if (!settingStore.preferences.save_path) {
    await settingStore.fetchPreferences()
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

<style module>
.settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

.tabsContainer {
  flex: 1;
  overflow: hidden;
}

.tabsContainer :global(.n-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabsContainer :global(.n-tabs-nav) {
  padding: 8px 0;
}

.tabsContainer :global(.n-tabs-pane-wrapper) {
  flex: 1;
  overflow: hidden;
}

.tabContent {
  padding: 20px;
}

.divider {
  margin: 0;
}

.actions {
  padding: 16px 20px;
}

@media (max-width: 768px) {
  .tabContent {
    padding: 16px;
  }

  .actions {
    padding: 12px 16px;
  }
}
</style>
