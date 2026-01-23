<template>
  <n-modal :show="show" @update:show="onUpdateShow" preset="dialog">
    <template #header>
      <div class="font-bold text-lg">{{ $t('aboutDialog.title') }}</div>
    </template>
    <div>
      <div>{{ $t('aboutDialog.webClient') }}</div>
      <div>{{ $t('aboutDialog.version', { version: sessionStore.version ?? '--' }) }}</div>
      <div>{{ $t('aboutDialog.clientVersion', { version: clientVersion }) }}</div>
      <div>{{ $t('aboutDialog.server', { server: serverHost }) }}</div>
      <a class="mt-2" href="https://github.com/jianxcao/qbittorrent-web.git" target="_blank">{{
        $t('aboutDialog.author', { email: 'jianxcao@126.com' })
      }}</a>
    </div>
    <template #action>
      <n-button type="primary" @click="onUpdateShow(false)">{{ $t('common.close') }}</n-button>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
import { useSessionStore } from '@/store'
import { useSettingStore } from '@/store'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const settingStore = useSettingStore()
const { t: $t } = useI18n()
defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show'])

function onUpdateShow(v: boolean) {
  emit('update:show', v)
}

const sessionStore = useSessionStore()
const serverHost = computed(() => settingStore.serverHost)

// 从 package.json 获取客户端版本号
const clientVersion = computed(() => {
  // 通过 Vite 注入的全局变量获取版本号
  return __APP_VERSION__
})
</script>
