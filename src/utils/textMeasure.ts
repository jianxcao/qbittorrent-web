/**
 * 文本宽度测量工具
 * 使用 Canvas API 测量文本宽度，并带有 LRU 缓存优化
 */

import LRUCache from './lru'

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
    return cached
  }

  // 测量文本宽度
  let textWidth = 0
  try {
    // 创建临时 canvas 来测量文本
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = `${fontWeight} ${fontSize}px sans-serif`
      const metrics = ctx.measureText(text)
      textWidth = metrics.width
    }
  } catch (e) {
    // 如果 canvas 测量失败，使用粗略估算：字符数 * 字体大小 * 0.6
    textWidth = text.length * fontSize * 0.6
  }

  // 缓存结果
  textWidthCache.set(cacheKey, textWidth)

  return textWidth
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
