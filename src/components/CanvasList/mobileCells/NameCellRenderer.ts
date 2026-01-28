import type { MobileCellRenderer, MobileCellRenderContext } from '../mobileTypes'
import { Text, Ellipse, Group, Rect } from 'leafer-ui'
import { MENU_BUTTON_SIZE, MENU_BUTTON_MARGIN, MOBILE_CELL_SPACING } from '../mobileConstants'
import { measureTextWidth } from '@/utils'
import { FONT_FAMILY } from '../constant'

/**
 * 名称 Cell 渲染器
 * 第一行：分类标签（如果有）
 * 下面：种子名称（最多2行，从头开始）
 * 右侧：三点菜单按钮
 */
class NameCellRenderer implements MobileCellRenderer {
  calculateHeight(ctx: Omit<MobileCellRenderContext, 'y' | 'height'>): number {
    // 如果有分类，需要额外的一行
    // tag 行：24px + 名称两行：48px = 72px
    const hasCategory = ctx.row.category && ctx.row.category.trim() !== ''
    return (hasCategory ? 72 : 52) + MOBILE_CELL_SPACING
  }

  render(ctx: MobileCellRenderContext, group: Group): void {
    const { row, x, y, width, height, theme } = ctx

    // 计算可用宽度（减去菜单按钮占用空间）
    const availableWidth = width - MENU_BUTTON_SIZE - MENU_BUTTON_MARGIN

    let nameStartY = y

    // 如果有分类，先渲染分类标签（独立一行）
    if (row.category && row.category.trim() !== '') {
      this.renderCategoryTag(row.category, x, y, availableWidth, theme, group)
      nameStartY = y + 24 + 4 // tag 高度 24px + 4px 间距
    }

    // 渲染名称文本（最多2行，从头开始）
    const nameText = new Text({
      text: row.name || '',
      x: x,
      y: nameStartY,
      width: availableWidth,
      height: 50, // 两行文本的高度
      fill: theme.textColor1,
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 24,
      textWrap: 'break',
      overflow: 'hide',
      textOverflow: 'ellipsis',
      fontFamily: FONT_FAMILY
    } as any)

    group.add(nameText)

    // 渲染三点菜单按钮
    this.renderMenuButton(x + availableWidth + MENU_BUTTON_MARGIN, y, group, theme, row)
  }

  /**
   * 渲染分类标签（独立一行）
   */
  private renderCategoryTag(category: string, x: number, y: number, maxWidth: number, theme: any, group: Group): void {
    const tagPaddingX = 8
    const tagRadius = 4
    const tagHeight = 22
    const fontSize = 12

    // 计算 tag 实际宽度
    // 使用工具函数测量文本宽度（带缓存优化）
    const textWidth = measureTextWidth(category, fontSize, 'normal')

    // 计算 tag 实际宽度（限制为可用宽度的70%，避免标签过长）
    const maxTagWidth = Math.min(maxWidth * 0.7, 150) // 最大不超过可用宽度的70%或150px
    const tagWidth = Math.min(textWidth + tagPaddingX * 2, maxTagWidth)

    // Tag 背景颜色
    const tagBgColor = `color-mix(in srgb, ${theme.primaryColor} 15%, ${theme.cardColor} 85%)`
    const tagTextColor = `color-mix(in srgb, ${theme.primaryColor} 80%, ${theme.textColor2} 20%)`

    // 绘制 tag 背景
    const tagBg = new Rect({
      x: x,
      y: y + 1, // 稍微向下偏移
      width: tagWidth,
      height: tagHeight,
      fill: tagBgColor,
      cornerRadius: tagRadius
    })
    group.add(tagBg)

    // 绘制 tag 文本（确保文本不会溢出标签背景）
    const textContentWidth = tagWidth - tagPaddingX * 2
    const tagText = new Text({
      text: category,
      x: x + tagPaddingX,
      y: y + 1,
      fill: tagTextColor,
      fontSize: fontSize,
      fontWeight: 'normal',
      textAlign: 'left',
      verticalAlign: 'middle',
      width: textContentWidth,
      height: tagHeight,
      overflow: 'hide' as any,
      textOverflow: 'ellipsis',
      fontFamily: FONT_FAMILY
    } as any)
    group.add(tagText)
  }

  /**
   * 渲染三点菜单按钮（垂直排列的三个圆点）
   */
  private renderMenuButton(x: number, y: number, group: Group, theme: any, row: any): void {
    // 创建方形背景框，方便判断点击范围
    const menuButtonGroup = new Group({
      x: x + 9,
      y: y - 6,
      name: 'menuButton'
    })

    // 背景框
    const buttonBg = new Rect({
      x: 0,
      y: 0,
      width: MENU_BUTTON_SIZE,
      height: MENU_BUTTON_SIZE,
      fill: 'transparent',
      cornerRadius: 6,
      name: 'menuButtonGroup',
      cursor: 'pointer'
    })

    menuButtonGroup.add(buttonBg)

    // 三个圆点 - 透明背景下调整位置更居中
    const centerX = MENU_BUTTON_SIZE / 2 + 1 // 稍微往右偏移
    const startY = 12 // 往上移动，更好的视觉居中

    const dotRadius = 2.5 // 稍微增大圆点
    const dotSpacing = 7 // 增加间距

    for (let i = 0; i < 3; i++) {
      const dot = new Ellipse({
        x: centerX - dotRadius,
        y: startY + i * dotSpacing - dotRadius,
        width: dotRadius * 2,
        height: dotRadius * 2,
        fill: theme.textColor3
      })
      menuButtonGroup.add(dot)
    }

    group.add(menuButtonGroup)
  }

  /**
   * 检测点击是否在菜单按钮区域内
   */
  static isClickInMenuButton(clickX: number, clickY: number, cardWidth: number, cellY: number): boolean {
    const menuButtonX = cardWidth - MENU_BUTTON_SIZE - MENU_BUTTON_MARGIN
    return clickX >= menuButtonX && clickX <= cardWidth && clickY >= cellY && clickY <= cellY + MENU_BUTTON_SIZE
  }
}

export const nameCellRenderer = new NameCellRenderer()
export { NameCellRenderer }
