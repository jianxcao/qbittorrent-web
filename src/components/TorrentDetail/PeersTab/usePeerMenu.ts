import { computed, nextTick, ref } from 'vue'
import type { TorrentPeer } from '@/api/types'
import type { DropdownOption } from 'naive-ui'
import { renderIcon } from '@/utils'
import { AddCircle, BanOutline, CopySharp } from '@vicons/ionicons5'
import { useI18n } from '@/composables/useI18n'

export function usePeerMenu() {
  const { t } = useI18n()
  const showMenu = ref(false)
  const menuX = ref(0)
  const menuY = ref(0)
  const currentPeer = ref<TorrentPeer | null>(null)
  const selectedPeerKeys = ref<string[]>([])

  const menuOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      {
        label: t('torrentDetail.peers.menuAddPeers'),
        key: 'add-peers',
        icon: renderIcon(AddCircle, '#2080f0')
      },
      {
        label: t('torrentDetail.peers.menuCopyIpPort'),
        key: 'copy-ip-port',
        icon: renderIcon(CopySharp, '#18a058')
      },
      {
        label: t('torrentDetail.peers.menuBanPermanently'),
        key: 'ban-permanently',
        icon: renderIcon(BanOutline, '#d03050')
      }
    ]
    return options
  })

  function onRowContextMenu(row: TorrentPeer, event: MouseEvent) {
    event.preventDefault()
    const peerKey = `${row.ip}:${row.port}`
    if (!selectedPeerKeys.value.includes(peerKey)) {
      selectedPeerKeys.value = [peerKey]
    }
    currentPeer.value = row
    menuX.value = event.clientX
    menuY.value = event.clientY
    showMenu.value = false
    nextTick(() => {
      showMenu.value = true
      window.addEventListener('click', closeMenu, { once: true })
    })
  }

  function closeMenu() {
    showMenu.value = false
  }

  return {
    showMenu,
    menuX,
    menuY,
    currentPeer,
    selectedPeerKeys,
    menuOptions,
    onRowContextMenu,
    closeMenu
  }
}
