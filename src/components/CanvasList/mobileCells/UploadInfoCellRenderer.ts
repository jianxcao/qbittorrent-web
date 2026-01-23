import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Text } from 'leafer-ui'
import { formatSpeed, formatSize, formatRatio } from '@/utils'
import { MOBILE_CELL_SPACING } from '../mobileConstants'

/**
 * 上传信息 Cell 渲染器
 * 渲染：↑ 上传速度 | 上传总量 | 分享率
 * 宽度分配：5% + 30% + 30% + 35%
 */
class UploadInfoCellRenderer implements MobileCellRenderer {
  calculateHeight(): number {
    // 单行文本高度
    return 20 + MOBILE_CELL_SPACING
  }

  render(ctx: MobileCellRenderContext, group: any): void {
    const { row, x, y, width, theme } = ctx

    // 格式化数据
    const uploadSpeed = formatSpeed(row.upspeed || 0)
    const uploadedSize = formatSize(row.uploaded || 0)
    const shareRatio = formatRatio(row.ratio)

    // 宽度分配
    const iconWidth = width * 0.05
    const speedWidth = width * 0.3
    const sizeWidth = width * 0.3
    // shareRatioWidth = 剩余空间

    const fontSize = 12
    const textColor = theme.textColor3

    // 图标：↑（左对齐）
    const iconText = new Text({
      text: '↑',
      x: x,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'left',
      verticalAlign: 'top'
    })
    group.add(iconText)

    // 上传速度（右对齐到第一个分界点）
    const speedX = x + iconWidth + speedWidth
    const speedText = new Text({
      text: uploadSpeed,
      x: speedX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top'
    })
    group.add(speedText)

    // 上传总量（右对齐到第二个分界点）
    const sizeX = x + iconWidth + speedWidth + sizeWidth
    const sizeText = new Text({
      text: uploadedSize,
      x: sizeX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top'
    })
    group.add(sizeText)

    // 分享率（右对齐到最右侧）
    const ratioX = x + width
    const ratioText = new Text({
      text: shareRatio,
      x: ratioX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top'
    })
    group.add(ratioText)
  }
}

export const uploadInfoCellRenderer = new UploadInfoCellRenderer()
export { UploadInfoCellRenderer }
