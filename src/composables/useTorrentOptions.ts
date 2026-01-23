import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Torrent 相关的公共下拉选项和配置
 * 供 AddDialog 和 Settings 组件共用
 */
export function useTorrentOptions() {
  const { t } = useI18n()

  // 自动 Torrent 管理模式选项
  const autoTMMOptions = computed(() => [
    { label: t('addDialog.manual'), value: 'false' },
    { label: t('addDialog.automatic'), value: 'true' }
  ])

  // Torrent 管理模式选项（用于设置页面）
  const torrentManagementModeOptions = computed(() => [
    { label: t('addDialog.manual'), value: 'manual' },
    { label: t('addDialog.automatic'), value: 'automatic' }
  ])

  // Torrent 内容布局选项
  const contentLayoutOptions = computed(() => [
    { label: t('addDialog.layoutOriginal'), value: 'Original' },
    { label: t('addDialog.layoutSubfolder'), value: 'Subfolder' },
    { label: t('addDialog.layoutNoSubfolder'), value: 'NoSubfolder' }
  ])

  // 停止条件选项
  const stopConditionOptions = computed(() => [
    { label: t('addDialog.stopConditionNone'), value: 'None' },
    { label: t('addDialog.stopConditionMetadata'), value: 'MetadataReceived' },
    { label: t('addDialog.stopConditionFiles'), value: 'FilesChecked' }
  ])

  // 分类修改时的行为选项
  const categoryChangedActionOptions = computed(() => [
    { label: '重新定位 Torrent', value: 'relocate' },
    { label: '切换受影响的 torrent 至手动模式', value: 'switch_to_manual' }
  ])

  // 路径修改时的行为选项
  const pathChangedActionOptions = computed(() => [
    { label: '重新定位 Torrent', value: 'relocate' },
    { label: '切换受影响的 torrent 至手动模式', value: 'switch_to_manual' }
  ])

  // 监控文件夹模式选项
  const scanDirModeOptions = computed(() => [
    { label: t('settings.downloads.scanDirs.modeMonitoredFolder'), value: 0 },
    { label: t('settings.downloads.scanDirs.modeDefaultSaveLocation'), value: 1 },
    { label: t('settings.downloads.scanDirs.modeCustomPath'), value: 'custom' }
  ])

  return {
    autoTMMOptions,
    torrentManagementModeOptions,
    contentLayoutOptions,
    stopConditionOptions,
    categoryChangedActionOptions,
    pathChangedActionOptions,
    scanDirModeOptions
  }
}
