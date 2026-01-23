import { computed, nextTick, ref } from 'vue'
import type { Tracker } from '@/api/types'
import type { DropdownOption } from 'naive-ui'
import { renderIcon } from '@/utils'
import { AddCircle, CopySharp, CreateOutline, Trash } from '@vicons/ionicons5'
import { useI18n } from '@/composables/useI18n'

export function isValidTrackerUrl(url: string) {
  return url.includes('://')
}

export function useTrackerMenu() {
  const { t } = useI18n()
  const showMenu = ref(false)
  const menuX = ref(0)
  const menuY = ref(0)
  const currentTracker = ref<Tracker | null>(null)
  const selectedTrackerKeys = ref<string[]>([])

  const menuOptions = computed<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      {
        label: t('torrentDetail.trackers.menuAdd'),
        key: 'add',
        icon: renderIcon(AddCircle, '#2080f0')
      }
    ]

    const allURLs = selectedTrackerKeys.value.every((url) => isValidTrackerUrl(url))
    if (!allURLs) {
      return options
    }

    const canEdit = selectedTrackerKeys.value.length === 1
    options.push(
      {
        label: t('torrentDetail.trackers.menuEdit'),
        key: 'edit',
        icon: renderIcon(CreateOutline, '#f0a020'),
        disabled: !canEdit
      },
      {
        label: t('torrentDetail.trackers.menuRemove'),
        key: 'remove',
        icon: renderIcon(Trash, '#d03050')
      },
      {
        label: t('torrentDetail.trackers.menuCopy'),
        key: 'copy',
        icon: renderIcon(CopySharp, '#18a058')
      }
    )
    return options
  })

  function onRowContextMenu(row: Tracker, event: MouseEvent) {
    event.preventDefault()
    if (!selectedTrackerKeys.value.includes(row.url)) {
      selectedTrackerKeys.value = [row.url]
    }
    currentTracker.value = row
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
    currentTracker,
    selectedTrackerKeys,
    menuOptions,
    onRowContextMenu,
    closeMenu
  }
}
