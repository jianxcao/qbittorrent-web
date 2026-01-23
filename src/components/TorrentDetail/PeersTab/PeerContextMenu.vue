<template>
  <n-dropdown
    v-model:show="showMenu"
    trigger="manual"
    :x="menuX"
    :y="menuY"
    :options="menuOptions"
    :animated="false"
    :z-index="1000"
    @select="onMenuSelect"
  />
  <AddPeersDialog v-model:show="showAddPeersDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { copyToClipboard } from '@/utils'
import { usePeerMenu } from './usePeerMenu'
import { useI18n } from '@/composables/useI18n'
import AddPeersDialog from './AddPeersDialog.vue'
import { banPeers } from '@/api/modules/transfer'

const { t } = useI18n()
const message = useMessage()

const { showMenu, menuX, menuY, selectedPeerKeys, menuOptions, onRowContextMenu: handleRowContextMenu } = usePeerMenu()

const showAddPeersDialog = ref(false)

async function onMenuSelect(key: string) {
  showMenu.value = false

  if (key === 'add-peers') {
    showAddPeersDialog.value = true
    return
  }

  if (key === 'copy-ip-port') {
    await handleCopyIpPort()
    return
  }

  if (key === 'ban-permanently') {
    await handleBanPermanently()
    return
  }
}

async function handleCopyIpPort() {
  if (!selectedPeerKeys.value.length) {
    return
  }

  const text = selectedPeerKeys.value.join('\n')
  const success = await copyToClipboard(text)

  if (success) {
    message.success(t('torrentDetail.peers.copied'))
  } else {
    message.error(t('messages.copyFailed'))
  }
}

async function handleBanPermanently() {
  if (!selectedPeerKeys.value.length) {
    return
  }

  try {
    // 调用 banPeers API 封禁选中的 peers
    await banPeers(selectedPeerKeys.value)
    message.success(t('torrentDetail.peers.banSuccess'))
  } catch (error) {
    message.error(t('torrentDetail.peers.banFailed'))
    console.error('Ban peer failed:', error)
  }
}

defineExpose({
  onRowContextMenu: handleRowContextMenu,
  selectedPeerKeys
})
</script>
