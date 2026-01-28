import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Text, Rect } from 'leafer-ui'
import { MOBILE_CELL_SPACING } from '../mobileConstants'
import { qbStateIconMap } from '@/const/status'
import type { QBTorrentState } from '@/api/types'
import { i18n } from '@/i18n'
import { FONT_FAMILY } from '../constant'

/**
 * 进度状态 Cell 渲染器
 * 渲染：进度条 | 百分比文本 | 状态标签
 */
class ProgressStatusCellRenderer implements MobileCellRenderer {
  calculateHeight(): number {
    // 进度条行高度
    return 28 + MOBILE_CELL_SPACING
  }

  render(ctx: MobileCellRenderContext, group: any): void {
    const { row, x, y, width, theme } = ctx

    const progressTextWidth = 55
    const statusTagWidth = 110
    const progressBarWidth = width - progressTextWidth - statusTagWidth

    const progressBarX = x
    const progressTextX = x + progressBarWidth
    const statusTagX = x + progressBarWidth + progressTextWidth

    // 绘制进度条
    this.renderProgressBar(
      row.progress || 0,
      progressBarX,
      y + 10,
      progressBarWidth,
      4,
      theme,
      group
    )

    // 绘制百分比文本
    this.renderProgressText(
      row.progress || 0,
      progressTextX,
      y,
      progressTextWidth,
      28,
      theme,
      group
    )

    // 绘制状态标签
    this.renderStatusTag(
      row.state,
      statusTagX,
      y + 5,
      statusTagWidth,
      18,
      theme,
      group
    )
  }

  /**
   * 渲染进度条
   */
  private renderProgressBar(
    progress: number,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any,
    group: any
  ): void {
    // 背景
    const bgRect = new Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: theme.dividerColor,
      cornerRadius: height / 2
    })
    group.add(bgRect)

    // 进度填充
    if (progress > 0) {
      const fillWidth = width * progress
      const fillRect = new Rect({
        x: x,
        y: y,
        width: fillWidth,
        height: height,
        fill: progress >= 1 ? theme.successColor : theme.primaryColor,
        cornerRadius: height / 2
      })
      group.add(fillRect)
    }
  }

  /**
   * 渲染百分比文本
   */
  private renderProgressText(
    progress: number,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any,
    group: any
  ): void {
    const progressText = `${Math.round(progress * 100)}%`
    const text = new Text({
      text: progressText,
      x: x,
      y: y,
      width: width,
      height: height,
      fill: theme.textColor2,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'right',
      verticalAlign: 'middle',
      fontFamily: FONT_FAMILY
    })
    group.add(text)
  }

  /**
   * 渲染状态标签
   */
  private renderStatusTag(
    state: QBTorrentState,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any,
    group: any
  ): void {
    const stateInfo = qbStateIconMap[state]
    const t = i18n.global.t

    // 获取状态文本
    const stateText = state ? t(this.getStateI18nKey(state)) : '-'

    // 获取状态颜色
    const statusColor = stateInfo?.color || theme.textColor2
    const bgColor = `color-mix(in srgb, ${statusColor} 15%, transparent)`

    // 背景标签
    const tagBg = new Rect({
      x: x + width - 90, // 右对齐，标签宽度约90px
      y: y,
      width: 90,
      height: height,
      fill: bgColor,
      stroke: statusColor,
      strokeWidth: 1,
      cornerRadius: height / 2
    })
    group.add(tagBg)

    // 状态文本
    const tagText = new Text({
      text: stateText,
      x: x + width - 90,
      y: y,
      width: 90,
      height: height,
      fill: statusColor,
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
      verticalAlign: 'middle',
      textOverflow: 'ellipsis',
      fontFamily: FONT_FAMILY
    } as any)
    group.add(tagText)
  }

  /**
   * 获取状态的 i18n 键
   */
  private getStateI18nKey(state: QBTorrentState): string {
    // 简化显示，按照 statusFilter 分类
    if (state === 'metaDL' || state === 'forcedMetaDL') {
      return 'statusFilter.metaDL'
    }
    if (['downloading', 'allocating', 'stalledDL', 'queuedDL'].includes(state)) {
      return 'statusFilter.downloading'
    }
    if (state === 'stoppedDL' || state === 'pausedDL') {
      return 'statusFilter.stoppedDownloading'
    }
    if (['uploading', 'forcedUP', 'stalledUP', 'queuedUP', 'checkingUP', 'stoppedUP', 'pausedUP'].includes(state)) {
      return 'statusFilter.seeding'
    }
    if (state === 'checkingResumeData' || state === 'checkingDL') {
      return 'statusFilter.checking'
    }
    if (state === 'moving') {
      return 'statusFilter.moving'
    }
    if (state === 'error' || state === 'missingFiles') {
      return 'statusFilter.errored'
    }
    return 'torrentState.unknown'
  }
}

export const progressStatusCellRenderer = new ProgressStatusCellRenderer()
export { ProgressStatusCellRenderer }
