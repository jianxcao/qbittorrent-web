import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { formatSize } from '@/utils'
import { FONT_FAMILY } from '../constant'

/**
 * 大小单元格渲染器
 * 将字节数格式化为易读的大小字符串（如 1.23 GB）
 */
export class SizeCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 格式化大小
    const formattedValue = formatSize(typeof value === 'number' ? value : 0)

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
      overflow: 'hide' as any,
      fontFamily: FONT_FAMILY
    } as any)

    leaferGroup.add(textElement)
  }
}
