import type { CellRenderer, CellRenderContext } from '../types'
import { Group, Rect, Text } from 'leafer-ui'
import type { Group as LeaferGroup } from 'leafer-ui'
import { FONT_FAMILY } from '../constant'
import { measureTextWidth } from '@/utils'
import { tagColor } from '@/utils/tagColor'

const FONT_SIZE = 11
const TAG_HEIGHT = 18
const GAP = 4
const PAD_X = 6
const PADDING = 8

interface TagLayout {
  name: string
  width: number
  color: ReturnType<typeof tagColor>
}

const layoutCache = new Map<string, TagLayout>()

function tagLayout(name: string): TagLayout {
  const cached = layoutCache.get(name)
  if (cached) {
    return cached
  }
  const layout = {
    name,
    width: Math.ceil(measureTextWidth(name, FONT_SIZE)) + PAD_X * 2,
    color: tagColor(name)
  }
  layoutCache.set(name, layout)
  return layout
}

/**
 * 标签列渲染器。
 * 只缓存标签宽度和颜色。列表刷新会销毁旧节点，胶囊本身每次按缓存重建。
 */
export class TagsCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: LeaferGroup): void {
    const { row, x, y, width, height } = ctx
    const tags = String(row.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (!tags.length) {
      return
    }

    let tagX = x + PADDING
    const limit = x + width - PADDING
    const tagY = y + (height - TAG_HEIGHT) / 2
    for (const name of tags) {
      const layout = tagLayout(name)
      if (tagX + layout.width > limit) {
        break
      }
      const pill = new Group({ x: tagX, y: tagY, width: layout.width, height: TAG_HEIGHT, hittable: false })
      pill.add(
        new Rect({
          width: layout.width,
          height: TAG_HEIGHT,
          cornerRadius: TAG_HEIGHT / 2,
          fill: layout.color.background,
          stroke: layout.color.border,
          strokeWidth: 1,
          hittable: false
        })
      )
      pill.add(
        new Text({
          text: layout.name,
          width: layout.width,
          height: TAG_HEIGHT,
          fill: layout.color.text,
          fontSize: FONT_SIZE,
          textAlign: 'center',
          verticalAlign: 'middle',
          fontFamily: FONT_FAMILY,
          hittable: false
        } as any)
      )
      leaferGroup.add(pill)
      tagX += layout.width + GAP
    }
  }
}
