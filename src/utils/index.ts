import { NIcon } from 'naive-ui'
import { h } from 'vue'

/**
 * 从 url 字符串中提取域名（host）
 * @param url 完整 url
 * @returns host 部分，如 example.com:1234
 */
export function getHostFromUrl(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

const SISuffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']

export function formatSpeed(value: number = 0): string {
  let unit = ''
  let divisor = 1.0

  for (unit of SISuffixes) {
    if (value < 1024 * divisor) {
      break
    }
    divisor *= 1024
  }

  const tmp = value / divisor

  let fp = 2
  if (tmp >= 100) {
    fp = 1
  }
  if (tmp >= 1000) {
    fp = 0
  }
  if (unit === 'B') {
    fp = 0
  }

  return `${tmp.toFixed(fp)} ${unit}/S`
}

/**
 * 格式化文件大小（字节）为带单位的字符串
 * @param size 文件大小（字节）
 * @returns 如 1.23 GB
 */
export function formatSize(size: number = 0): string {
  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024
  const TB = GB * 1024
  const PB = TB * 1024
  const EB = PB * 1024
  const ZB = EB * 1024
  if (size >= ZB) {
    return (size / ZB).toFixed(2) + ' ZB'
  }
  if (size >= EB) {
    return (size / EB).toFixed(2) + ' EB'
  }
  if (size >= PB) {
    return (size / PB).toFixed(2) + ' PB'
  }
  if (size >= TB) {
    return (size / TB).toFixed(2) + ' TB'
  }
  if (size >= GB) {
    return (size / GB).toFixed(2) + ' GB'
  }
  if (size >= MB) {
    return (size / MB).toFixed(2) + ' MB'
  }
  if (size >= KB) {
    return (size / KB).toFixed(2) + ' KB'
  }
  if (isNaN(size)) {
    return ' '
  }
  return size + ' B'
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function timeToStr(value: number, coarse: boolean = true): string {
  let duration = {
    days: Math.floor(value / 86400),
    hours: Math.floor(value / 3600) % 24,
    minutes: Math.floor(value / 60) % 60,
    seconds: value % 60
  }
  // Make it coarse
  if (coarse) {
    if (duration.days >= 10) {
      duration = { days: duration.days, hours: 0, minutes: 0, seconds: 0 }
    } else if (duration.days > 0) {
      duration = { ...duration, minutes: 0, seconds: 0 }
    } else if (duration.days > 0 || duration.hours > 0) {
      duration.seconds = 0
    }
  }
  let s = ''
  if (duration.days > 0) {
    s = `${duration.days}d`
  }
  if (duration.hours > 0) {
    s = (s !== '' ? s + ' ' : '') + `${duration.hours}h`
  }
  if (duration.minutes > 0) {
    s = (s !== '' ? s + ' ' : '') + `${duration.minutes}m`
  }
  if (duration.seconds > 0) {
    s = (s !== '' ? s + ' ' : '') + `${duration.seconds}s`
  }
  return s
}

export function ensurePathDelimiter(...paths: string[]): string {
  if (paths.length === 0) {
    return ''
  }
  // 1. 过滤空字符串
  const filtered = paths.filter(Boolean)
  if (filtered.length === 0) {
    return ''
  }
  // 2. 判断分隔符，优先以第一个路径的分隔符为准
  let delimiter = '/'
  if (filtered[0].includes('\\')) {
    delimiter = '\\'
  }
  // 3. 去除每一段的首尾分隔符
  const cleaned = filtered.map((p, i) => {
    let s = p
    if (i !== 0) {
      // 不是第一个，去掉开头分隔符
      while (s.startsWith(delimiter)) {
        s = s.slice(1)
      }
    }
    if (i !== filtered.length - 1) {
      // 不是最后一个，去掉结尾分隔符
      while (s.endsWith(delimiter)) {
        s = s.slice(0, -1)
      }
    }
    return s
  })
  return cleaned.join(delimiter)
}

// This regex has some chars that are only invalid on windows but not linux/mac
// But we have to be safe and use them all to ensure that multi client
// environments where clients are on different OSes are interoperable.
const badChars = /[<>:"\\/|?*]/g

export function fileSystemSafeName(name: string) {
  return name.replace(badChars, '_')
}

export function renderIcon(icon: any, color?: string, size?: number) {
  return () =>
    h(
      NIcon,
      {
        color: color,
        size: size
      },
      { default: () => h(icon) }
    )
}

export function isMac() {
  let isMac = false
  const userAgentData = (navigator as any).userAgentData
  if (userAgentData?.platform) {
    isMac = userAgentData.platform.toUpperCase().includes('MAC')
  } else {
    isMac = navigator.userAgent.toUpperCase().includes('MAC')
  }
  return isMac
}

/**
 * 格式化 Unix 时间戳为本地日期时间字符串
 * @param timestamp Unix 时间戳（秒）
 * @returns 格式化后的日期时间字符串，格式为 YYYY-MM-DD HH:mm
 */
export function formatTimestamp(timestamp: number = 0): string {
  if (!timestamp || timestamp <= 0) {
    return '-'
  }

  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化分享比率
 * @param ratio 比率值
 * @returns 格式化后的比率字符串，保留两位小数
 */
export function formatRatio(ratio: number = 0): string {
  if (isNaN(ratio)) {
    return '-'
  }
  // 参考官方qBittorrent实现: -1 表示无限大
  if (ratio === -1 || !isFinite(ratio)) {
    return '∞'
  }
  return ratio.toFixed(2)
}

// 导出复制相关工具函数
export { copyToClipboard, isClipboardSupported } from './clipboard'

// 导出文本测量工具函数
export { measureTextWidth, clearTextWidthCache, getTextWidthCacheStats } from './textMeasure'

/**
 * 比较两个版本号
 * @param v1 版本号1 (e.g. "v5.1.2", "5.1.2")
 * @param v2 版本号2
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 == v2
 */
export function compareVersion(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/, '').split('.').map(Number)
  const p1 = clean(v1)
  const p2 = clean(v2)
  const len = Math.max(p1.length, p2.length)

  for (let i = 0; i < len; i++) {
    const n1 = p1[i] || 0
    const n2 = p2[i] || 0
    if (n1 > n2) {
      return 1
    }
    if (n1 < n2) {
      return -1
    }
  }
  return 0
}
