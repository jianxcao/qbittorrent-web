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

interface TagRow {
  signature: string
  node: Group
}

const layoutCache = new Map<string, TagLayout>()
const rowCache: TagRow[] = []

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

function paintTag(node: Group, layout: TagLayout, x: number, y: number) {
  node.set({ x, y, width: layout.width, height: TAG_HEIGHT })
  node.add(
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
  node.add(
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
}

/**
 * 标签列渲染器。
 * 标签宽度和颜色按名称缓存。可见行的胶囊组也缓存，标签不变时只移动位置。
 */
export class TagsCellRenderer implements CellRenderer {
  private rowCursor = 0

  begin() {
    this.rowCursor = 0
  }

  render(ctx: CellRenderContext, leaferGroup: LeaferGroup): void {
    const { row, x, y, width, height } = ctx
    const tags = String(row.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (!tags.length) {
      return
    }

    const visible: TagLayout[] = []
    let cursor = x + PADDING
    const limit = x + width - PADDING
    for (const name of tags) {
      const layout = tagLayout(name)
      if (cursor + layout.width > limit) {
        break
      }
      visible.push(layout)
      cursor += layout.width + GAP
    }
    if (!visible.length) {
      return
    }

    const signature = `${width}:${visible.map((item) => item.name).join('\0')}`
    let cached = rowCache[this.rowCursor]
    if (!cached) {
      cached = { signature: '', node: new Group({ hittable: false }) }
      rowCache[this.rowCursor] = cached
    }
    this.rowCursor += 1

    const node = cached.node
    if (node.parent && node.parent !== leaferGroup) {
      node.remove()
    }
    node.x = 0
    node.y = y + (height - TAG_HEIGHT) / 2
    if (cached.signature !== signature) {
      node.removeAll()
      let tagX = x + PADDING
      for (const layout of visible) {
        const pill = new Group({ hittable: false })
        paintTag(pill, layout, tagX, 0)
        node.add(pill)
        tagX += layout.width + GAP
      }
      cached.signature = signature
    } else {
      let tagX = x + PADDING
      visible.forEach((layout, index) => {
        const pill = node.children?.[index]
        if (pill) {
          pill.x = tagX
        }
        tagX += layout.width + GAP
      })
    }
    if (node.parent !== leaferGroup) {
      leaferGroup.add(node)
    }
  }
}
