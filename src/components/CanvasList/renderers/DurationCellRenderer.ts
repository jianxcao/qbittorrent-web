import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'

/**
 * 格式化时长（支持年、天、时、分、秒）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0 || seconds === 8640000) {
    return '∞' // 无限大或未知
  }

  // 定义时间单位（秒）
  const YEAR = 365 * 24 * 3600
  const DAY = 24 * 3600
  const HOUR = 3600
  const MINUTE = 60

  const years = Math.floor(seconds / YEAR)
  const days = Math.floor((seconds % YEAR) / DAY)
  const hours = Math.floor((seconds % DAY) / HOUR)
  const minutes = Math.floor((seconds % HOUR) / MINUTE)
  const secs = Math.floor(seconds % MINUTE)

  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years}年`)
  }
  if (days > 0) {
    parts.push(`${days}天`)
  }
  if (hours > 0) {
    parts.push(`${hours}时`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}分`)
  }
  // 只在小于1小时时才显示秒
  if (secs > 0 && years === 0 && days === 0 && hours === 0) {
    parts.push(`${secs}秒`)
  }

  return parts.length > 0 ? parts.join(' ') : '0秒'
}

/**
 * 时长单元格渲染器
 * 将时间值（秒）格式化为友好的时间字符串（如 2年 3天 5时 15分）
 * 用于 ETA、活动时间、重新汇报时间等列
 */
export class DurationCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 格式化时长值
    const formattedValue = formatDuration(typeof value === 'number' ? value : 0)

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 居中对齐显示
    const padding = 12
    const textX = x + padding

    // 创建文本元素
    const textElement = new Text({
      text: formattedValue,
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
