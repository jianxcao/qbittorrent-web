import type { CellRenderer, CellRenderContext } from '../types'
import { Text, Rect, Group } from 'leafer-ui'
import type { Group as LeaferGroup } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'

/**
 * Category 标签单元格渲染器
 * 将 category 渲染为带背景色和圆角的 tag 样式
 * 支持文本溢出省略，最大宽度为单元格宽度
 */
export class CategoryCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: LeaferGroup): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 文本内容处理
    const textValue = value?.toString() ?? ''

    // 如果没有内容，不渲染
    if (!textValue) {
      return
    }

    // Tag 样式配置
    const padding = 12 // 单元格左侧padding
    const tagPaddingX = 10 // tag 内部水平padding
    const tagPaddingY = 6 // tag 内部垂直padding
    const tagRadius = 4 // 圆角半径
    const tagMaxWidth = width - padding * 2 // tag 的最大宽度

    // 创建临时文本元素来测量文本宽度
    const tempText = new Text({
      text: textValue,
      fontSize: 13,
      fontWeight: 'normal',
      fontFamily: FONT_FAMILY
    })
    const textMetrics = tempText.getBounds('box')
    const textWidth = textMetrics.width

    // 计算 tag 实际宽度（不超过最大宽度）
    const tagContentWidth = Math.min(textWidth + tagPaddingX * 2, tagMaxWidth)
    const tagHeight = 24 // tag 固定高度

    // 计算 tag 位置（垂直居中）
    const tagX = x + padding
    const tagY = y + (height - tagHeight) / 2

    // Tag 背景颜色 - 使用主题色的浅色版本
    const tagBgColor = isSelected
      ? `color-mix(in srgb, ${theme.primaryColor} 30%, ${theme.cardColor} 70%)`
      : `color-mix(in srgb, ${theme.primaryColor} 15%, ${theme.cardColor} 85%)`

    // Tag 文本颜色
    const tagTextColor = isSelected
      ? theme.primaryColor
      : `color-mix(in srgb, ${theme.primaryColor} 80%, ${theme.textColor2} 20%)`

    // 创建 tag 组
    const tagGroup = new Group()

    // 绘制 tag 背景
    const tagBg = new Rect({
      x: tagX,
      y: tagY,
      width: tagContentWidth,
      height: tagHeight,
      fill: tagBgColor,
      cornerRadius: tagRadius
    })
    tagGroup.add(tagBg)

    // 绘制 tag 文本
    const tagText = new Text({
      text: textValue,
      x: tagX + tagPaddingX,
      y: tagY,
      fill: tagTextColor,
      fontSize: 13,
      fontWeight: 'normal',
      textAlign: 'left',
      verticalAlign: 'middle',
      width: tagContentWidth - tagPaddingX * 2,
      height: tagHeight,
      overflow: 'hide' as any,
      textOverflow: 'ellipsis',
      textWrap: 'none',
      fontFamily: FONT_FAMILY
    } as any)
    tagGroup.add(tagText)

    leaferGroup.add(tagGroup)
  }
}
