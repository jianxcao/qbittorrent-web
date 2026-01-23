import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Text } from 'leafer-ui'
import { formatTimestamp } from '@/utils'

/**
 * 日期信息 Cell 渲染器
 * 渲染：创建日期（左） | 完成时间（右）
 * 注意：作为最后一行，不需要额外的底部间距
 */
class DateInfoCellRenderer implements MobileCellRenderer {
  calculateHeight(): number {
    // 单行文本高度，不需要额外的底部间距（后面就是卡片底部padding）
    return 20
  }

  render(ctx: MobileCellRenderContext, group: any): void {
    const { row, x, y, width, theme } = ctx

    // 格式化日期
    const addedDate = formatTimestamp(row.added_on)
    const completionDate = formatTimestamp(row.completion_on)

    const fontSize = 12
    const textColor = theme.textColor3

    // 左侧：创建日期
    const addedText = new Text({
      text: addedDate,
      x: x,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'left',
      verticalAlign: 'top'
    })
    group.add(addedText)

    // 右侧：完成时间
    const completionText = new Text({
      text: completionDate,
      x: x + width,
      y: y,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top'
    })
    group.add(completionText)
  }
}

export const dateInfoCellRenderer = new DateInfoCellRenderer()
export { DateInfoCellRenderer }
