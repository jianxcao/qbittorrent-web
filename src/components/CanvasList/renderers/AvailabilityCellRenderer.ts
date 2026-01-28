import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'

/**
 * 可用性单元格渲染器
 * 显示种子的可用性（availability）
 * 参考官方qBittorrent实现：保留三位小数
 */
export class AvailabilityCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 格式化可用性值，参考官方实现
    // -1 直接显示 -1，其他值保留三位小数
    let formattedValue = '-'
    if (typeof value === 'number') {
      if (value === -1) {
        formattedValue = '-1'
      } else if (value >= 0) {
        formattedValue = value.toFixed(3)
      }
    }

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 右对齐显示（与官方保持一致）
    const padding = 12

    // 创建文本元素
    const textElement = new Text({
      text: formattedValue,
      x: x + padding,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'right',
      verticalAlign: 'middle',
      width: width - padding * 2,
      height: height,
      overflow: 'hide' as any,
      fontFamily: FONT_FAMILY
    } as any)

    leaferGroup.add(textElement)
  }
}
