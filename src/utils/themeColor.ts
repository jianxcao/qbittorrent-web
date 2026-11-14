/**
 * 主题派生颜色缓存。
 * 渲染器在每一行/列都会重复调用 colord(...).alpha().mix().toRgbString()，
 * 而这些计算结果只依赖 theme 对象里的颜色值。
 * 以 theme 对象引用为 key（WeakMap），theme 引用不变时直接命中缓存，
 * theme 变化时旧对象可被 GC，新对象走新缓存，天然无泄漏。
 */
const colorCache = new WeakMap<object, Map<string, string>>()

/**
 * 按 theme 引用缓存一个派生颜色字符串。
 * @param theme 主题对象（作为缓存 key）
 * @param cacheKey 计算标识，需能区分不同颜色/参数
 * @param compute 实际计算函数，仅首次或 theme 变化时执行
 */
export function cachedThemeColor(theme: object, cacheKey: string, compute: () => string): string {
  let map = colorCache.get(theme)
  if (!map) {
    map = new Map()
    colorCache.set(theme, map)
  }
  let value = map.get(cacheKey)
  if (value === undefined) {
    value = compute()
    map.set(cacheKey, value)
  }
  return value
}
