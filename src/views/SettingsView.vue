<template>
  <n-layout :class="$style.layout">
    <n-layout-header :class="$style.header" bordered>
      <div :class="$style.headerContent">
        <n-button quaternary circle @click="onBack">
          <template #icon>
            <n-icon :component="ArrowBackSharp" />
          </template>
        </n-button>
        <h2 :class="$style.title">{{ $t('settings.title') }}</h2>
      </div>
    </n-layout-header>
    <n-layout-content :class="$style.content">
      <SettingsLayout :active-tab="activeTab" @close="onClose" @saved="onSaved" />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import SettingsLayout from '@/components/Settings/SettingsLayout.vue'
import { ArrowBackSharp } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t: $t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  return (route.params.tab as string) || 'behavior'
})

function onBack() {
  router.push('/')
}

function onClose() {
  router.push('/')
}

function onSaved() {
  // 保存成功后可以选择返回首页或停留
  // router.push('/')
}
</script>

<style module>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 56px;
}

.headerContent {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
