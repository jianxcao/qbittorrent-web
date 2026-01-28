import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Text } from 'leafer-ui'
import { formatSpeed, formatSize } from '@/utils'
import { MOBILE_CELL_SPACING } from '../mobileConstants'
import { FONT_FAMILY } from '../constant'

/**
 * 下载信息 Cell 渲染器
 * 渲染：↓ 下载速度 | 下载总量 | 选中大小
 * 宽度分配：5% + 30% + 30% + 35%
 */
class DownloadInfoCellRenderer implements MobileCellRenderer {
  calculateHeight(): number {
    // 单行文本高度
    return 20 + MOBILE_CELL_SPACING
  }

  render(ctx: MobileCellRenderContext, group: any): void {
    const { row, x, y, width, theme } = ctx

    // 格式化数据
    const downloadSpeed = formatSpeed(row.dlspeed || 0)
    const downloadedSize = formatSize(row.downloaded || 0)
    const selectedSize = formatSize(row.total_size || 0)

    // 宽度分配
    const iconWidth = width * 0.05
    const speedWidth = width * 0.3
    const sizeWidth = width * 0.3
    // selectedWidth = 剩余空间

    const fontSize = 12
    const textColor = theme.textColor3

    // 图标：↓（左对齐）
    const iconText = new Text({
      text: '↓',
      x: x,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'left',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    group.add(iconText)

    // 下载速度（右对齐到第一个分界点）
    const speedX = x + iconWidth + speedWidth
    const speedText = new Text({
      text: downloadSpeed,
      x: speedX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    group.add(speedText)

    // 下载总量（右对齐到第二个分界点）
    const sizeX = x + iconWidth + speedWidth + sizeWidth
    const sizeText = new Text({
      text: downloadedSize,
      x: sizeX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    group.add(sizeText)

    // 选中大小（右对齐到最右侧）
    const selectedX = x + width
    const selectedText = new Text({
      text: selectedSize,
      x: selectedX,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    group.add(selectedText)
  }
}

export const downloadInfoCellRenderer = new DownloadInfoCellRenderer()
export { DownloadInfoCellRenderer }
