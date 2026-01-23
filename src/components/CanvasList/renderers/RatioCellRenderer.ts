import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { formatRatio } from '@/utils'

/**
 * 比率单元格渲染器
 * 将比率值格式化为保留两位小数的字符串（如 1.57）
 */
export class RatioCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 格式化比率
    const formattedValue = formatRatio(typeof value === 'number' ? value : 0)

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 右对齐显示
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
      overflow: 'hide' as any
    } as any)

    leaferGroup.add(textElement)
  }
}
