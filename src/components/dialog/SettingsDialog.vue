<template>
  <n-modal v-model:show="visible" :style="modalStyle" @update:show="onUpdateShow">
    <div class="settings-dialog">
      <div class="settings-dialog__header">
        <h2 class="settings-dialog__title">{{ $t('settings.title') }}</h2>
        <n-button text @click="onClose">
          <template #icon>
            <n-icon :size="20" :component="CloseOutline" />
          </template>
        </n-button>
      </div>
      <div class="settings-dialog__content">
        <SettingsLayout :active-tab="activeTab" @close="onClose" @saved="onSaved" />
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import SettingsLayout from '@/components/Settings/SettingsLayout.vue'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { CloseOutline } from '@vicons/ionicons5'

const show = defineModel<boolean>('show', { required: true })

const { t: $t } = useI18n()
const route = useRoute()
const isMobile = useIsSmallScreen()
const visible = ref(false)
const activeTab = ref('behavior')

const modalStyle = computed(() => {
  if (isMobile.value) {
    return {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      borderRadius: '0'
    }
  }
  return {
    width: '90vw',
    maxWidth: '1200px',
    height: '85vh',
    maxHeight: '800px'
  }
})

watch(show, (val) => {
  visible.value = val
  if (val && route.query.tab) {
    activeTab.value = route.query.tab as string
  }
})

watch(visible, (val) => {
  if (val !== show.value) {
    show.value = val
  }
})

function onUpdateShow(val: boolean) {
  show.value = val
}

function onClose() {
  show.value = false
}

function onSaved() {
  // 保存后关闭弹窗
  show.value = false
}
</script>

<style scoped lang="less">
.settings-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: color-mix(in srgb, var(--n-color) 35%, transparent);
  -webkit-backdrop-filter: blur(15px) brightness(95%);
  backdrop-filter: blur(15px) brightness(95%);
  border-radius: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid var(--n-border-color);
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__content {
    flex: 1;
    padding: 12px;
    padding-top: 0;
    overflow: hidden;
  }
}

[data-theme='light'] {
  .settings-dialog {
    background-color: color-mix(in srgb, var(--n-color) 70%, transparent);
    -webkit-backdrop-filter: blur(15px) brightness(95%);
    backdrop-filter: blur(15px) brightness(95%);
  }
}
</style>
