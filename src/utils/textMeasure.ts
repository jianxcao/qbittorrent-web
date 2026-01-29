/**
 * 文本宽度测量工具
 * 使用 Canvas API 测量文本宽度，并带有 LRU 缓存优化
 */
import { Text } from 'leafer-ui'
import LRUCache from './lru'
import { FONT_FAMILY } from '@/components/CanvasList/constant'

// 创建 LRU 缓存，最多缓存 500 个测量结果
const textWidthCache = new LRUCache<string, number>(500)

/**
 * 生成缓存键
 */
function getCacheKey(text: string, fontSize: number, fontWeight: string | number = 'normal'): string {
  return `${text}|${fontSize}|${fontWeight}`
}

/**
 * 测量文本宽度（带缓存）
 * @param text 要测量的文本
 * @param fontSize 字体大小（px）
 * @param fontWeight 字体粗细（可选，默认 'normal'）
 * @returns 文本宽度（px）
 */
export function measureTextWidth(text: string, fontSize: number, fontWeight: string | number = 'normal'): number {
  // 生成缓存键
  const cacheKey = getCacheKey(text, fontSize, fontWeight)

  // 尝试从缓存获取
  const cached = textWidthCache.get(cacheKey)
  if (cached !== undefined) {
    return Math.ceil(cached)
  }

  const t = new Text({
    text: text,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontFamily: FONT_FAMILY
  })
  const textWidth = t.getBounds('box').width
  // 缓存结果
  textWidthCache.set(cacheKey, textWidth)
  return Math.ceil(textWidth)
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
