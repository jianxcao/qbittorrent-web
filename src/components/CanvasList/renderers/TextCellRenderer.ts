import type { CellRenderer, CellRenderContext, TextRendererOptions } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'

/**
 * 文本单元格渲染器
 * 支持文本溢出省略、对齐方式、加粗等
 */
export class TextCellRenderer implements CellRenderer {
  private options: Required<TextRendererOptions>

  constructor(options: TextRendererOptions = {}) {
    this.options = {
      ellipsis: options.ellipsis ?? true,
      bold: options.bold ?? false,
      align: options.align ?? 'left'
    }
  }

  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 文本内容处理
    const textValue = value?.toString() ?? ''

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 计算文本元素位置和大小（考虑对齐方式和内边距）
    const padding = 12
    const textX = x + padding
    const textWidth = width - padding * 2
    const textAlign: 'left' | 'center' | 'right' = this.options.align

    // 创建文本元素
    const textElement = new Text({
      text: textValue,
      x: textX,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: this.options.bold ? 'bold' : 'normal',
      textAlign: textAlign,
      verticalAlign: 'middle',
      textWrap: 'none',
      width: textWidth,
      height: height,
      overflow: 'hide' as any,
      textOverflow: this.options.ellipsis ? 'ellipsis' : 'clip'
    } as any)

    leaferGroup.add(textElement)
  }
}
