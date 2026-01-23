<template>
  <n-modal v-model:show="visible" preset="dialog" :title="t('torrentDetail.peers.addPeersTitle')">
    <div class="add-peers-dialog">
      <div class="form-item">
        <div class="form-label">{{ t('torrentDetail.peers.peersListLabel') }}</div>
        <n-input
          v-model:value="peersInput"
          type="textarea"
          :placeholder="t('torrentDetail.peers.peersPlaceholder')"
          :rows="10"
          :autosize="{ minRows: 10, maxRows: 20 }"
        />
      </div>
    </div>

    <template #action>
      <n-space justify="end">
        <n-button @click="handleCancel">{{ t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleConfirm" :loading="loading">{{ t('common.confirm') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useI18n } from '@/composables/useI18n'
import { addPeers } from '@/api/modules/torrents'
import { useTorrentStore } from '@/store'

const { t } = useI18n()
const message = useMessage()
const torrentStore = useTorrentStore()

const visible = defineModel<boolean>('show', { default: false })
const peersInput = ref('')
const loading = ref(false)

watch(visible, (newVal) => {
  if (newVal) {
    peersInput.value = ''
  }
})

function handleCancel() {
  visible.value = false
}

async function handleConfirm() {
  if (!peersInput.value.trim()) {
    message.warning(t('torrentDetail.peers.peersRequired'))
    return
  }

  if (!torrentStore.selectedKeys.length) {
    message.error(t('torrentDetail.peers.noTorrentSelected'))
    return
  }

  loading.value = true
  try {
    // 将输入的每一行作为一个 peer（格式：IP:端口 或 [IPv6]:端口）
    const peers = peersInput.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (peers.length === 0) {
      message.warning(t('torrentDetail.peers.peersRequired'))
      return
    }

    await addPeers(torrentStore.selectedKeys.join('|'), peers)
    message.success(t('torrentDetail.peers.addPeersSuccess'))
    visible.value = false
  } catch (error) {
    message.error(t('torrentDetail.peers.addPeersFailed'))
    console.error('Add peers failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.add-peers-dialog {
  padding: 16px 0;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color-1);
}
</style>
