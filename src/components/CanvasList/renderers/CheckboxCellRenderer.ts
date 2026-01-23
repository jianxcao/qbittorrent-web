import type { CellRenderer, CellRenderContext } from '../types'
import { Rect, Group, Polygon } from 'leafer-ui'

/**
 * Checkbox 单元格渲染器
 * 用于渲染选择列的复选框
 */
export class CheckboxCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { x, y, width, height, isSelected, theme } = ctx
    const checkboxGroup = new Group()

    // Checkbox 尺寸和位置
    const checkboxSize = 16
    const centerX = x + width / 2
    const centerY = y + height / 2

    if (isSelected) {
      // 选中状态：绘制选中的复选框（带勾选）
      const outerRect = new Rect({
        x: centerX - checkboxSize / 2,
        y: centerY - checkboxSize / 2,
        width: checkboxSize,
        height: checkboxSize,
        cornerRadius: 2,
        fill: theme.primaryColor,
        stroke: theme.primaryColor,
        strokeWidth: 1
      })
      checkboxGroup.add(outerRect)

      // 使用 Polygon 绘制勾选符号（更漂亮的勾选样式）
      // 勾选符号的路径点：从左下 -> 底部 -> 右上
      const checkSize = checkboxSize * 0.6 // 勾选符号占 checkbox 的 60%
      const checkStartX = centerX - checkSize / 4
      const checkStartY = centerY

      // 对勾颜色建议：
      // '#ffffff' - 纯白色（标准设计，对比度最高）
      // '#e8f4ff' - 浅蓝白色（柔和优雅）
      // 'rgba(255, 255, 255, 0.95)' - 半透明白色（现代感）
      // theme.successColor - 跟随主题的成功色
      const checkColor = 'rgba(255, 255, 255, 0.95)'

      const checkMark = new Polygon({
        points: [
          checkStartX - 2,
          checkStartY - 1,
          checkStartX - 2,
          checkStartY + 1,
          checkStartX + 1,
          checkStartY + 4,
          checkStartX + 3,
          checkStartY + 4,
          checkStartX + 6,
          checkStartY - 2,
          checkStartX + 6,
          checkStartY - 4,
          checkStartX + 3,
          checkStartY,
          checkStartX + 1,
          checkStartY + 2
        ],
        fill: checkColor
      } as any)
      checkboxGroup.add(checkMark)
    } else {
      // 未选中状态：绘制空心复选框
      const outerRect = new Rect({
        x: centerX - checkboxSize / 2,
        y: centerY - checkboxSize / 2,
        width: checkboxSize,
        height: checkboxSize,
        cornerRadius: 2,
        fill: 'transparent',
        stroke: theme.borderColor,
        strokeWidth: 1.5
      })
      checkboxGroup.add(outerRect)
    }
    leaferGroup.add(checkboxGroup)
  }
}
