import type { CellRenderer, CellRenderContext } from '../types'
import { Text, Rect, Group } from 'leafer-ui'
import { colord } from 'colord'
import type { Group as LeaferGroup } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'
import { measureTextWidth } from '@/utils'

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
    const tagPaddingX = 10 // tag 内部水平paddin
    const tagRadius = 4 // 圆角半径
    const tagMaxWidth = width - padding * 2 // tag 的最大宽度
    const textWidth = measureTextWidth(textValue, 13, 'normal') * 1.15

    // 计算 tag 实际宽度（不超过最大宽度）
    const tagContentWidth = Math.min(textWidth + tagPaddingX * 2, tagMaxWidth)
    const tagHeight = 24 // tag 固定高度

    // 计算 tag 位置（垂直居中）
    const tagX = x + padding
    const tagY = y + (height - tagHeight) / 2

    // Tag 背景颜色 - 使用主题色的浅色版本
    const tagBgColor = isSelected
      ? colord(theme.primaryColor).alpha(0.3).mix(theme.cardColor, 0.7).toRgbString()
      : colord(theme.primaryColor).alpha(0.15).mix(theme.cardColor, 0.85).toRgbString()

    // Tag 文本颜色
    const tagTextColor = isSelected
      ? theme.primaryColor
      : colord(theme.primaryColor).alpha(0.8).mix(theme.textColor2, 0.2).toRgbString()

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
      textOverflow: 'ellipsis',
      textWrap: 'none',
      fontFamily: FONT_FAMILY
    })
    tagGroup.add(tagText)

    leaferGroup.add(tagGroup)
  }
}
