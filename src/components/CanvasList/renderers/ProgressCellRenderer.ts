import type { CellRenderer, CellRenderContext } from '../types'
import { Rect, Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'

/**
 * 进度条单元格渲染器
 * 渲染进度条背景、填充和百分比文本
 */
export class ProgressCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, theme } = ctx

    // 进度值处理（0-1 或 0-100）
    let progress = typeof value === 'number' ? value : 0
    if (progress > 1) {
      progress = progress / 100 // 转换为 0-1 范围
    }
    progress = Math.max(0, Math.min(1, progress)) // 限制在 0-1 范围

    // 进度条样式参数
    const barHeight = 28
    const barY = y + (height - barHeight) / 2
    const padding = 8
    const barWidth = width - padding * 2
    const cornerRadius = 8

    // 1. 绘制背景矩形
    const bgRect = new Rect({
      x: x + padding,
      y: barY,
      width: barWidth,
      height: barHeight,
      fill: theme.dividerColor,
      cornerRadius
    })
    leaferGroup.add(bgRect)

    // 2. 绘制进度填充矩形
    const fillWidth = barWidth * progress
    if (fillWidth > 0) {
      const fillRect = new Rect({
        x: x + padding,
        y: barY,
        width: fillWidth,
        height: barHeight,
        fill: progress >= 1 ? theme.successColor : theme.primaryColor,
        cornerRadius
      })
      leaferGroup.add(fillRect)
    }

    // 3. 绘制百分比文本
    const percentText = `${Math.round(progress * 100)}%`
    // 文本颜色：进度超过50%时使用白色，否则使用普通文本色
    const textColor = progress > 0.5 ? '#ffffff' : theme.textColor2

    const textElement = new Text({
      text: percentText,
      x: x + width / 2,
      y: y,
      fill: textColor,
      fontSize: 12,
      textAlign: 'center',
      verticalAlign: 'middle',
      height: height,
      fontWeight: 'bold'
    })
    leaferGroup.add(textElement)
  }
}
