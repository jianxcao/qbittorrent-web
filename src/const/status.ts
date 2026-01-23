import type { QBTorrentState, Torrent } from '@/api/types'
import ClockIcon from '@/assets/icons/clock.svg?component'
import DismissSquareIcon from '@/assets/icons/dismissSquare.svg?component'
import {
  AlertCircleOutline,
  CaretDownCircle,
  CaretForwardCircle,
  CaretUpCircle,
  CheckmarkSharp,
  Magnet,
  Pause as PauseIcon,
  // Shuffle,
  SnowOutline,
  StopCircleOutline,
  SwapVertical,
  SyncOutline,
  TimeOutline
} from '@vicons/ionicons5'

// qBittorrent 状态图标映射
// 参考: src/webui/api/serialize/serialize_torrent.cpp
export const qbStateIconMap: Record<QBTorrentState, { icon: any; color: string }> = {
  // 下载状态
  downloading: {
    icon: CaretDownCircle,
    color: '#3498db'
  },
  // 下载元数据
  metaDL: {
    icon: Magnet, // 使用磁力链接图标突出元数据下载的特殊性
    color: '#ff8c00'
  },
  // 强制下载元数据
  forcedMetaDL: {
    icon: Magnet, // 使用磁力链接图标突出元数据下载的特殊性
    color: '#e67e22'
  },
  // 分配磁盘空间
  allocating: {
    icon: TimeOutline, // 使用时钟图标表示初始化耗时操作
    color: '#3bc9db'
  },
  // 下载停滞
  stalledDL: {
    icon: PauseIcon,
    color: '#7f8c8d' // 深灰色表示停滞状态
  },
  // 检查下载
  checkingDL: {
    icon: SyncOutline,
    color: '#3bc9db'
  },
  // 强制下载
  forcedDL: {
    icon: CaretDownCircle,
    color: '#2980b9'
  },
  // 下载队列中
  queuedDL: {
    icon: ClockIcon, // 使用时钟图标表示等待队列
    color: '#3bc9db'
  },
  // 暂停下载（旧版本，已废弃）
  pausedDL: {
    icon: StopCircleOutline,
    color: '#95a5a6'
  },
  // 已停止下载（v5.0.0+）
  stoppedDL: {
    icon: StopCircleOutline,
    color: '#95a5a6'
  },

  // 上传状态
  uploading: {
    icon: CaretUpCircle,
    color: '#27ae60'
  },
  // 上传停滞
  stalledUP: {
    icon: PauseIcon,
    color: '#7f8c8d' // 深灰色表示停滞状态
  },
  // 检查上传
  checkingUP: {
    icon: SyncOutline,
    color: '#3bc9db' // 与 checking 过滤器保持一致
  },
  // 强制上传
  forcedUP: {
    icon: CaretUpCircle,
    color: '#1e8449'
  },
  // 上传队列中
  queuedUP: {
    icon: ClockIcon, // 使用时钟图标表示等待队列
    color: '#27ae60'
  },
  // 暂停上传（旧版本，已废弃）
  pausedUP: {
    icon: StopCircleOutline,
    color: '#95a5a6'
  },
  // 已停止上传（v5.0.0+）
  stoppedUP: {
    icon: StopCircleOutline,
    color: '#95a5a6'
  },

  // 错误和特殊状态
  error: {
    icon: DismissSquareIcon,
    color: '#e74c3c'
  },
  missingFiles: {
    icon: DismissSquareIcon, // 与 errored 过滤器保持一致
    color: '#e74c3c' // 与 errored 过滤器保持一致
  },
  // 检查恢复数据
  checkingResumeData: {
    icon: SyncOutline,
    color: '#3bc9db' // 与 checking 过滤器保持一致
  },
  // 移动文件中
  moving: {
    icon: SwapVertical,
    color: '#f39c12'
  },
  // 未知状态
  unknown: {
    icon: AlertCircleOutline,
    color: '#95a5a6'
  }
}

// qBittorrent 状态过滤器
// 参考 qBittorrent 官方实现：
// - src/gui/transferlistfilters/statusfilterwidget.cpp
// - src/base/torrentfilter.h
// - src/webui/www/private/views/filters.html
export const qbStatusFilters = [
  {
    key: 'downloading',
    label: (t: any) => t('statusFilter.downloading'),
    // isDownloading: 正在下载（包括强制下载、元数据下载、分配空间等）
    filter: (t: Torrent) =>
      [
        'downloading',
        'metaDL',
        'forcedMetaDL',
        'forcedDL',
        'allocating',
        'stalledDL',
        'queuedDL',
        'checkingDL',
        'stoppedDL'
      ].includes(t.state as string),
    icon: CaretDownCircle,
    color: '#3498db'
  },
  {
    key: 'seeding',
    label: (t: any) => t('statusFilter.seeding'),
    // isUploading: 正在上传/做种（包括强制上传）
    filter: (t: Torrent) =>
      ['uploading', 'forcedUP', 'stalledUP', 'queuedUP', 'checkingUP'].includes(t.state as string),
    icon: CaretUpCircle,
    color: '#27ae60'
  },
  {
    key: 'completed',
    label: (t: any) => t('statusFilter.completed'),
    // isCompleted: 已完成（进度 >= 1）
    filter: (t: Torrent) => {
      return t.progress >= 1 || (t.size > 0 && t.completed >= t.size)
    },
    icon: CheckmarkSharp,
    color: '#27ae60'
  },
  {
    key: 'running',
    label: (t: any) => t('statusFilter.running'),
    // isRunning: 正在运行（非暂停状态）
    // 兼容旧版本的 pausedDL/pausedUP 和新版本的 stoppedDL/stoppedUP
    filter: (t: Torrent) => !['pausedDL', 'pausedUP', 'stoppedDL', 'stoppedUP'].includes(t.state as string),
    icon: CaretForwardCircle,
    color: '#3498db'
  },
  {
    key: 'stopped',
    label: (t: any) => t('statusFilter.stopped'),
    // isStopped: 已停止（暂停状态）
    // 兼容旧版本的 pausedDL/pausedUP 和新版本的 stoppedDL/stoppedUP
    filter: (t: Torrent) => ['pausedDL', 'pausedUP', 'stoppedDL', 'stoppedUP'].includes(t.state as string),
    icon: StopCircleOutline, // 停止圆圈图标，与暂停图标区分
    color: '#95a5a6'
  },
  {
    key: 'active',
    label: (t: any) => t('statusFilter.active'),
    // isActive: 活动中（有上传或下载速度）
    filter: (t: Torrent) => {
      return t.dlspeed > 0 || t.upspeed > 0
    },
    icon: SwapVertical,
    color: '#27ae60'
  },
  {
    key: 'inactive',
    label: (t: any) => t('statusFilter.inactive'),
    // isInactive: 空闲（无上传下载速度且非暂停状态）
    // 兼容旧版本的 pausedDL/pausedUP 和新版本的 stoppedDL/stoppedUP
    filter: (t: Torrent) => {
      return (
        t.dlspeed === 0 &&
        t.upspeed === 0 &&
        !['pausedDL', 'pausedUP', 'stoppedDL', 'stoppedUP', 'error', 'missingFiles'].includes(t.state as string)
      )
    },
    icon: SnowOutline,
    color: '#95a5a6'
  },
  {
    key: 'stalled',
    label: (t: any) => t('statusFilter.stalled'),
    // Stalled: 停滞（包括上传停滞和下载停滞）
    filter: (t: Torrent) => ['stalledDL', 'stalledUP'].includes(t.state as string),
    icon: PauseIcon, // 与 stalledUploading/stalledDownloading 保持一致
    color: '#7f8c8d' // 深灰色表示停滞状态
  },
  {
    key: 'stalledUploading',
    label: (t: any) => t('statusFilter.stalledUploading'),
    // StalledUploading: 上传停滞（无peer连接或无数据传输）
    filter: (t: Torrent) => t.state === 'stalledUP',
    icon: PauseIcon, // 禁止符号表示被阻塞/停滞
    color: '#7f8c8d' // 深灰色表示停滞状态
  },
  {
    key: 'stalledDownloading',
    label: (t: any) => t('statusFilter.stalledDownloading'),
    // StalledDownloading: 下载停滞（无peer连接或无数据传输）
    filter: (t: Torrent) => t.state === 'stalledDL',
    icon: PauseIcon, // 禁止符号表示被阻塞/停滞
    color: '#7f8c8d' // 深灰色表示停滞状态
  },
  {
    key: 'checking',
    label: (t: any) => t('statusFilter.checking'),
    // Checking: 正在检查（包括检查上传、检查下载、检查恢复数据）
    filter: (t: Torrent) => ['checkingDL', 'checkingUP', 'checkingResumeData'].includes(t.state as string),
    icon: SyncOutline,
    color: '#3bc9db'
  },
  {
    key: 'moving',
    label: (t: any) => t('statusFilter.moving'),
    // Moving: 正在移动文件
    filter: (t: Torrent) => t.state === 'moving',
    icon: SwapVertical,
    color: '#f39c12'
  },
  {
    key: 'errored',
    label: (t: any) => t('statusFilter.errored'),
    // Errored: 错误状态（包括缺失文件）
    filter: (t: Torrent) => t.state === 'error' || t.state === 'missingFiles',
    icon: DismissSquareIcon,
    color: '#e74c3c'
  }
]

// qBittorrent 状态过滤器映射
export const qbStatusFilterFunMap = new Map(qbStatusFilters.map((filter) => [filter.key, filter.filter]))

// 获取状态图标和颜色的统一函数
export function getStatusIconAndColor(torrent: Torrent): { icon: any; color: string } {
  // 优先使用 qBittorrent 状态
  if (torrent.state && qbStateIconMap[torrent.state]) {
    return qbStateIconMap[torrent.state]
  }

  // 如果qBittorrent状态不匹配，使用默认状态

  // 默认状态
  return {
    icon: AlertCircleOutline,
    color: '#95a5a6'
  }
}
