import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { qbStateIconMap } from '@/const/status'
import type { QBTorrentState } from '@/api/types'
import { i18n } from '@/i18n'
import { FONT_FAMILY } from '../constant'

/**
 * 将具体状态映射到 statusFilter 分类
 * 按照 statusFilter 的逻辑进行分类显示
 */
function getStateCategory(state: QBTorrentState): string {
  if (state === 'metaDL') {
    return 'statusFilter.metaDL'
  }

  if (state === 'forcedMetaDL') {
    return 'statusFilter.forcedMetaDL'
  }

  if (state === 'forcedDL') {
    return 'statusFilter.forcedDL'
  }

  if (state === 'checkingDL') {
    return 'statusFilter.checkingDL'
  }

  // 下载相关状态 -> "下载"
  if (['downloading', 'allocating', 'stalledDL', 'queuedDL'].includes(state)) {
    return 'statusFilter.downloading'
  }

  if (state === 'stoppedDL') {
    return 'statusFilter.stoppedDownloading'
  }

  // 上传/做种相关状态 -> "做种"
  if (['uploading', 'forcedUP', 'stalledUP', 'queuedUP', 'checkingUP', 'stoppedUP'].includes(state)) {
    return 'statusFilter.seeding'
  }

  // 检查恢复数据 -> "检查"
  if (state === 'checkingResumeData') {
    return 'statusFilter.checking'
  }

  // 移动中 -> "移动"
  if (state === 'moving') {
    return 'statusFilter.moving'
  }

  // 错误状态 -> "错误"
  if (state === 'error' || state === 'missingFiles') {
    return 'statusFilter.errored'
  }

  // 未知状态
  return 'torrentState.unknown'
}

/**
 * 状态单元格渲染器
 * 按照 statusFilter 分类显示状态（简化显示）
 * 使用 i18n 多语言包进行翻译
 */
export class StateCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 获取状态分类文本（使用多语言包）
    const state = value as QBTorrentState
    const t = i18n.global.t
    const stateCategory = getStateCategory(state)
    const stateText = state ? t(stateCategory) : ''

    // 获取状态颜色
    const stateInfo = qbStateIconMap[state]
    const textColor = stateInfo ? stateInfo.color : isSelected ? theme.textColor1 : theme.textColor2

    // 居中显示
    const padding = 12
    const textX = x + padding

    // 创建文本元素
    const textElement = new Text({
      text: stateText,
      x: textX,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      width: width - padding * 2,
      height: height,
      overflow: 'hide' as any,
      textOverflow: 'ellipsis',
      fontFamily: FONT_FAMILY
    } as any)

    leaferGroup.add(textElement)
  }
}
