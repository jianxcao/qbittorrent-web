/**
 * 文本宽度测量工具
 * 使用原生 Canvas 2D 的 measureText 测量文本宽度，并带有 LRU 缓存优化。
 * 相比每次实例化 Leafer Text 节点并 getBounds，measureText 开销更低、无布局副作用。
 */
import LRUCache from './lru'
import { FONT_FAMILY } from '@/components/CanvasList/constant'

// 创建 LRU 缓存，最多缓存 500 个测量结果
const textWidthCache = new LRUCache<string, number>(500)

// 惰性创建的共享测量上下文（浏览器环境）
let measureCtx: CanvasRenderingContext2D | null = null
function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureCtx) {
    return measureCtx
  }
  if (typeof document === 'undefined') {
    return null
  }
  const canvas = document.createElement('canvas')
  measureCtx = canvas.getContext('2d')
  return measureCtx
}

/**
 * 生成缓存键
 */
function getCacheKey(text: string, fontSize: number, fontWeight: string | number = 'normal'): string {
  return `${text}|${fontSize}|${fontWeight}`
}

/**
 * 构造与渲染层一致的 font 字符串
 */
function buildFont(fontSize: number, fontWeight: string | number): string {
  const weight = typeof fontWeight === 'number' ? fontWeight : fontWeight
  return `${weight} ${fontSize}px ${FONT_FAMILY}`
}

/**
 * 测量文本宽度（带缓存）
 * @param text 要测量的文本
 * @param fontSize 字体大小（px）
 * @param fontWeight 字体粗细（可选，默认 'normal'）
 * @returns 文本宽度（px）
 */
export function measureTextWidth(text: string, fontSize: number, fontWeight: string | number = 'normal'): number {
  const cacheKey = getCacheKey(text, fontSize, fontWeight)
  const cached = textWidthCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  let width = 0
  const ctx = getMeasureContext()
  if (ctx) {
    ctx.font = buildFont(fontSize, fontWeight)
    width = ctx.measureText(text).width
  } else {
    // 无 DOM 环境的粗略估算（按字符数）
    width = text.length * fontSize * 0.6
  }

  const rounded = Math.ceil(width)
  textWidthCache.set(cacheKey, rounded)
  return rounded
}

/**
 * 清除文本宽度测量缓存
 */
export function clearTextWidthCache(): void {
  textWidthCache.clear()
}

/**
 * 获取缓存统计信息
 */
export function getTextWidthCacheStats() {
  return {
    size: textWidthCache.size,
    maxSize: 500
  }
}
