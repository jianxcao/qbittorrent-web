import type { ResizableGridColumn } from '@/components/ResizableGridTable/types'
import type { Tracker } from '@/api/types'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

export function useTrackerColumns() {
  const { t } = useI18n()

  const statusMap = computed<Record<number, string>>(() => ({
    0: t('torrentDetail.trackers.statusDisabled'),
    1: t('torrentDetail.trackers.statusNotContacted'),
    2: t('torrentDetail.trackers.statusWorking'),
    3: t('torrentDetail.trackers.statusUpdating'),
    4: t('torrentDetail.trackers.statusNotWorking')
  }))

  const trackerColumns = computed<ResizableGridColumn<Tracker>[]>(() => [
    {
      title: t('torrentDetail.trackers.tier'),
      key: 'tier',
      width: 60,
      sorter: 'default'
    },
    {
      title: t('torrentDetail.trackers.url'),
      key: 'url',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: t('torrentDetail.trackers.status'),
      key: 'status',
      width: 100,
      render(row) {
        return statusMap.value[row.status] || t('torrentDetail.trackers.statusUnknown')
      }
    },
    {
      title: t('torrentDetail.trackers.peers'),
      key: 'num_peers',
      width: 80,
      align: 'right'
    },
    {
      title: t('torrentDetail.trackers.seeds'),
      key: 'num_seeds',
      width: 80,
      align: 'right'
    },
    {
      title: t('torrentDetail.trackers.leeches'),
      key: 'num_leeches',
      width: 80,
      align: 'right'
    },
    {
      title: t('common.downloaded'),
      key: 'num_downloaded',
      width: 80,
      align: 'right'
    },
    {
      title: t('torrentDetail.trackers.message'),
      key: 'msg',
      ellipsis: {
        tooltip: true
      }
    }
  ])

  return {
    trackerColumns
  }
}
