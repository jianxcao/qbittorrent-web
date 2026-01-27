<template>
  <n-drawer
    v-model:show="visible"
    placement="right"
    width="92vw"
    to="body"
    :mask-closable="true"
    class="mobile-detail-drawer"
  >
    <n-drawer-content class="drawer-content">
      <div class="overlay flex items-center justify-center h-full" v-if="props.loading">
        <n-spin :show="true" />
      </div>
      <template #header>
        <div class="drawer-header" v-if="!props.loading">
          <h3 class="drawer-title">{{ selectedTorrentName }}</h3>
          <n-button quaternary circle size="small" @click="handleClose">
            <template #icon>
              <n-icon :component="CloseOutline" />
            </template>
          </n-button>
        </div>
      </template>
      <TorrentDetail v-if="!props.loading" />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { CloseOutline } from '@vicons/ionicons5'
import { useTorrentStore } from '@/store'
const props = defineProps<{
  loading: boolean
}>()
// ==================== Model ====================
const visible = defineModel<boolean>('visible', { required: true })

// ==================== Emits ====================
interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// ==================== Store ====================
const torrentStore = useTorrentStore()

// ==================== Computed ====================
// 获取当前选中的种子名称
const selectedTorrentName = computed(() => {
  const firstSelectedHash = torrentStore.selectedKeys[0]
  if (!firstSelectedHash) {
    return ''
  }
  const selectedTorrent = torrentStore.torrentsMap[firstSelectedHash]
  return selectedTorrent?.name || ''
})

// ==================== Methods ====================
function handleClose() {
  emit('close')
}
</script>

<style lang="less">
.mobile-detail-drawer {
  height: 100vh;
  height: 100dvh;
  padding-top: var(--top-inset);
  padding-bottom: var(--bottom-inset);
  overflow: hidden;
  .n-drawer-content-wrapper {
    .n-drawer-body-content-wrapper {
      padding: 4px;
    }
  }
  .n-drawer-content {
    .n-drawer-header {
      padding: 12px 0px 12px 12px;
      .drawer-header {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .drawer-title {
        flex: 1;
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        line-height: 1.4;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        text-overflow: ellipsis;
        word-break: break-all;
      }
    }
  }
}
</style>
