import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { formatTimestamp } from '@/utils'

/**
 * 时间戳单元格渲染器
 * 将 Unix 时间戳格式化为本地日期时间字符串（如 2024-01-10 08:00）
 */
export class TimestampCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme, columnKey } = ctx

    // 特殊处理：completion_on 为 0 时显示为空（未完成）
    let formattedValue = ''
    if (typeof value === 'number' && value > 0) {
      formattedValue = formatTimestamp(value)
    } else if (columnKey !== 'completion_on') {
      // 其他时间字段，0 也显示格式化的时间
      formattedValue = formatTimestamp(typeof value === 'number' ? value : 0)
    }

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 左对齐显示
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
      textAlign: 'left',
      verticalAlign: 'middle',
      width: width - padding * 2,
      height: height,
      overflow: 'hide' as any,
      textOverflow: 'ellipsis'
    } as any)

    leaferGroup.add(textElement)
  }
}
