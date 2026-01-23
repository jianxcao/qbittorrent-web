import type { CellRenderer, CellRenderContext } from '../types'
import { TextCellRenderer } from './TextCellRenderer'
import type { Group } from 'leafer-ui'

/**
 * 优先级单元格渲染器
 * 如果优先级为 0 或小于 0，显示 *，否则显示数字
 */
export class PriorityCellRenderer implements CellRenderer {
  private textRenderer: TextCellRenderer

  constructor() {
    this.textRenderer = new TextCellRenderer({ ellipsis: false, align: 'right' })
  }

  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value } = ctx
    
    // 处理无效值
    if (value === undefined || value === null) {
      this.textRenderer.render({ ...ctx, value: '' }, leaferGroup)
      return
    }

    const numValue = Number(value)
    let displayText = String(value)

    // 0 或负数显示 *
    if (!isNaN(numValue) && numValue <= 0) {
      displayText = '*'
    }

    // 代理给 TextCellRenderer 渲染
    this.textRenderer.render({ ...ctx, value: displayText }, leaferGroup)
  }
}
