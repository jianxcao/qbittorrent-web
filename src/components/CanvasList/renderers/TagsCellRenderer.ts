import type { CellRenderer, CellRenderContext } from '../types'
import { Rect, Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'
import { measureTextWidth } from '@/utils'
import { tagColor } from '@/utils/tagColor'

/**
 * 标签列渲染器
 * 在独立的标签列中绘制彩色胶囊，放不下的标签省略。
 */
export class TagsCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { row, x, y, width, height } = ctx
    const tags = String(row.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (!tags.length) {
      return
    }

    const fontSize = 11
    const tagHeight = 18
    const gap = 4
    const padX = 6
    const padding = 8
    let tagX = x + padding
    const limit = x + width - padding
    const tagY = y + (height - tagHeight) / 2

    for (const name of tags) {
      const pillWidth = Math.ceil(measureTextWidth(name, fontSize)) + padX * 2
      if (tagX + pillWidth > limit) {
        break
      }
      const color = tagColor(name)
      leaferGroup.add(
        new Rect({
          x: tagX,
          y: tagY,
          width: pillWidth,
          height: tagHeight,
          cornerRadius: tagHeight / 2,
          fill: color.background,
          stroke: color.border,
          strokeWidth: 1
        })
      )
      leaferGroup.add(
        new Text({
          text: name,
          x: tagX,
          y: tagY,
          width: pillWidth,
          height: tagHeight,
          fill: color.text,
          fontSize,
          textAlign: 'center',
          verticalAlign: 'middle',
          fontFamily: FONT_FAMILY
        } as any)
      )
      tagX += pillWidth + gap
    }
  }
}
