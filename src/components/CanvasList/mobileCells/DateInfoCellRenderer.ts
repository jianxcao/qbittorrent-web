import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Group, Rect, Text } from 'leafer-ui'
import { formatTimestamp } from '@/utils'
import { FONT_FAMILY } from '../constant'

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
    const height = 20

    // 计算左右两列的宽度（各占一半，中间留一点间距）
    const columnWidth = width / 2

    // 创建日期分组容器
    const dateGroup = new Group({
      x: x,
      y: y,
    })

    // 左侧：创建日期
    const addedText = new Text({
      text: addedDate,
      x: 0,
      y: 0,
      width: columnWidth,
      height: height,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'left',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    dateGroup.add(addedText)

    // 右侧：完成时间
    const completionText = new Text({
      text: completionDate,
      x: columnWidth,
      y: 0,
      width: columnWidth,
      height: height,
      fill: textColor,
      fontSize: fontSize,
      textAlign: 'right',
      verticalAlign: 'top',
      fontFamily: FONT_FAMILY
    })
    dateGroup.add(completionText)

    group.add(dateGroup)
  }
}

export const dateInfoCellRenderer = new DateInfoCellRenderer()
export { DateInfoCellRenderer }
