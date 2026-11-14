<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const refreshing = ref(false)
// 自己维护更新提示状态，完全接管 SW 更新检测。
// 不依赖 vite-plugin-pwa 的 useRegisterSW，因为插件对任何 waiting 事件都无条件弹窗，
// 会在「页面加载时残留 waiting SW」的场景下每次刷新都误弹一次。
const needRefresh = ref(false)

// sw.js 路径与 scope 跟随构建 base，避免自定义 VITE_BASE_URL 时错位
const SW_PATH = `${import.meta.env.BASE_URL}sw.js`.replace(/\/{2,}/g, '/')
const SW_SCOPE = import.meta.env.BASE_URL || '/'

// 更新检查间隔：每小时一次（Service Worker 默认检查频率很低，且只在有打开页面时）
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

let registration: ServiceWorkerRegistration | undefined
let updateTimer: number | undefined
// 记录「页面加载时已经存在」的 waiting SW。
// 这些是上次会话残留的旧 SW，不算「新版本更新」，是误报来源。
let waitingBeforeRegister: ServiceWorker | null = null

/**
 * 判断是否应该提示更新。
 * 只有同时满足以下条件才算「真正的新版本」：
 * 1. 存在 waiting SW；
 * 2. 页面已被旧 SW 控制（controller 存在，即不是首次安装）；
 * 3. 该 waiting SW 不是页面加载时就已存在的那个（即它是注册后新 install 出来的）。
 */
function promptIfPendingUpdate() {
  const waiting = registration?.waiting
  if (!waiting) {
    return
  }
  // 首次安装（没有 controller），不算更新
  if (!navigator.serviceWorker.controller) {
    return
  }
  // 页面加载时就已 waiting 的残留 SW，不提示
  if (waiting === waitingBeforeRegister) {
    return
  }
  needRefresh.value = true
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return
  }
  try {
    // 先记录注册前是否已有 waiting SW（残留）
    const existing = await navigator.serviceWorker.getRegistration()
    waitingBeforeRegister = existing?.waiting ?? null

    // 注册 SW（这里不主动 update，避免页面加载时触发不必要的更新检查；
    // 更新由下方定时器与切回前台时的检查驱动）
    registration = await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE })
    const reg = registration

    // 监听真正的更新：新 SW install 完成进入 waiting
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing
      if (!newWorker) {
        return
      }
      const onStateChange = () => {
        if (newWorker.state === 'installed') {
          newWorker.removeEventListener('statechange', onStateChange)
          promptIfPendingUpdate()
        }
      }
      newWorker.addEventListener('statechange', onStateChange)
      // 可能已经 installed
      if (newWorker.state === 'installed') {
        promptIfPendingUpdate()
      }
    })

    // 周期性检查更新
    if (updateTimer === undefined) {
      updateTimer = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL)
    }
  } catch (error) {
    console.error('Service worker registration failed', error)
  }
}

function checkForUpdate() {
  if (registration) {
    registration.update().catch((error) => {
      console.error('Service worker update check failed', error)
    })
  }
}

// 切回前台时立即检查一次
function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    checkForUpdate()
  }
}

onMounted(() => {
  registerServiceWorker()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (updateTimer !== undefined) {
    window.clearInterval(updateTimer)
    updateTimer = undefined
  }
})

async function refreshApp() {
  refreshing.value = true
  // 让 waiting 的 SW 跳过等待并接管页面
  const waiting = registration?.waiting
  if (waiting) {
    waiting.postMessage({ type: 'SKIP_WAITING' })
    // 等待接管后刷新页面
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  } else {
    window.location.reload()
  }
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
