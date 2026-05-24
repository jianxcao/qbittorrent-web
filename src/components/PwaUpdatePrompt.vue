<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const refreshing = ref(false)

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisterError(error) {
    console.error('Service worker registration failed', error)
  }
})

async function refreshApp() {
  refreshing.value = true
  await updateServiceWorker(true)
}

function dismissPrompt() {
  needRefresh.value = false
}
</script>

<template>
  <Transition name="pwa-update">
    <n-el v-if="needRefresh" class="pwa-update-prompt" role="alert">
      <div class="pwa-update-prompt__content">
        <div class="pwa-update-prompt__title">{{ t('pwa.updateTitle') }}</div>
        <div class="pwa-update-prompt__description">{{ t('pwa.updateDescription') }}</div>
      </div>
      <div class="pwa-update-prompt__actions">
        <n-button size="small" :disabled="refreshing" @click="dismissPrompt">
          {{ t('pwa.later') }}
        </n-button>
        <n-button size="small" type="primary" :loading="refreshing" @click="refreshApp">
          {{ t('pwa.refresh') }}
        </n-button>
      </div>
    </n-el>
  </Transition>
</template>

<style lang="less" scoped>
.pwa-update-prompt {
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: max(16px, env(safe-area-inset-bottom));
  z-index: 3000;
  width: min(360px, calc(100vw - 32px));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color-1);
  background: var(--modal-color);
  box-shadow: var(--box-shadow-2);

  &__content {
    min-width: 0;
    flex: 1;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__description {
    margin-top: 2px;
    color: var(--text-color-2);
    font-size: 12px;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }
}

.pwa-update-enter-active,
.pwa-update-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.pwa-update-enter-from,
.pwa-update-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 520px) {
  .pwa-update-prompt {
    left: max(12px, env(safe-area-inset-left));
    right: max(12px, env(safe-area-inset-right));
    bottom: max(12px, env(safe-area-inset-bottom));
    width: auto;
    align-items: stretch;
    flex-direction: column;

    &__actions {
      justify-content: flex-end;
    }
  }
}
</style>
