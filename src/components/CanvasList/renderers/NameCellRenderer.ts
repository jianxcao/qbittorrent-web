import type { CellRenderer, CellRenderContext } from '../types'
import { Text, Image } from 'leafer-ui'
import { Group } from 'leafer-ui'
import { qbStateIconMap, qbStatusFilters } from '@/const/status'
import type { QBTorrentState, Torrent } from '@/api/types'

// 导入 SVG 图标 - 按照 qbStatusFilters 的图标需求
import caretDownCircleSvg from '@/assets/icons/CaretDownCircle.svg?raw' // 下载
import caretUpCircleSvg from '@/assets/icons/CaretUpCircle.svg?raw' // 上传/做种
import magnetSvg from '@/assets/icons/magnet1.svg?raw' // 元数据（特殊）
import timeOutlineSvg from '@/assets/icons/timeOutline.svg?raw' // 分配空间（特殊）
import pauseSvg from '@/assets/icons/pause.svg?raw' // 停滞
import syncSvg from '@/assets/icons/sync.svg?raw' // 检查
import clockSvg from '@/assets/icons/clock.svg?raw' // 队列（特殊）
import stopCircleSvg from '@/assets/icons/stopCircle.svg?raw' // 停止
import dismissSquareSvg from '@/assets/icons/dismissSquare.svg?raw' // 错误
import swapVerticalSvg from '@/assets/icons/swapVertical.svg?raw' // 移动
import alertCircleSvg from '@/assets/icons/alertCircle.svg?raw' // 未知

/**
 * 将 SVG 字符串转换为带颜色的 Data URL
 */
function svgToDataUrl(svgString: string, color: string): string {
  // 替换 currentColor 为实际颜色
  const coloredSvg = svgString.replace(/currentColor/g, color)
  // 转换为 base64
  const base64 = btoa(coloredSvg)
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * 状态图标 SVG 映射
 * 按照 qbStatusFilters 的逻辑，优先使用特殊图标，其次使用过滤器分类图标
 */
const stateIconSvgMap: Record<string, string> = {
  // 特殊状态 - 使用独特图标以突出特殊性
  metaDL: magnetSvg, // 元数据下载 - 磁力链接特有
  forcedMetaDL: magnetSvg, // 强制元数据下载 - 磁力链接特有
  allocating: timeOutlineSvg, // 分配磁盘空间 - 初始化阶段
  queuedDL: clockSvg, // 下载队列 - 等待中
  queuedUP: clockSvg, // 上传队列 - 等待中

  // 停滞状态 - 使用禁止符号
  stalledDL: pauseSvg, // 下载停滞
  stalledUP: pauseSvg, // 上传停滞

  // 停止状态 - 使用停止符号
  pausedDL: stopCircleSvg, // 暂停下载（旧版本）
  stoppedDL: stopCircleSvg, // 停止下载（新版本）
  pausedUP: stopCircleSvg, // 暂停上传（旧版本）
  stoppedUP: stopCircleSvg, // 停止上传（新版本）

  // 检查状态 - 使用同步符号
  checkingDL: syncSvg, // 检查下载
  checkingUP: syncSvg, // 检查上传
  checkingResumeData: syncSvg, // 检查恢复数据

  // 下载类状态 - 使用下载箭头
  downloading: caretDownCircleSvg, // 下载中
  forcedDL: caretDownCircleSvg, // 强制下载

  // 上传/做种类状态 - 使用上传箭头
  uploading: caretUpCircleSvg, // 上传中
  forcedUP: caretUpCircleSvg, // 强制上传

  // 错误状态 - 使用错误图标
  error: dismissSquareSvg, // 错误
  missingFiles: dismissSquareSvg, // 文件缺失

  // 移动状态 - 使用移动图标
  moving: swapVerticalSvg, // 移动文件中

  // 未知状态 - 使用警告图标
  unknown: alertCircleSvg // 未知状态
}

/**
 * 图标缓存
 */
const iconCache = new Map<string, string>()

/**
 * 获取状态图标的 Data URL
 */
function getIconDataUrl(state: string, color: string): string {
  const cacheKey = `${state}-${color}`

  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!
  }

  const svgString = stateIconSvgMap[state]
  if (!svgString) {
    // 默认使用圆点
    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="${color}"/></svg>`
    const dataUrl = svgToDataUrl(defaultSvg, color)
    iconCache.set(cacheKey, dataUrl)
    return dataUrl
  }

  const dataUrl = svgToDataUrl(svgString, color)
  iconCache.set(cacheKey, dataUrl)
  return dataUrl
}

/**
 * 名称单元格渲染器
 * 在名称前显示状态图标（真实的 SVG 图标）
 */
export class NameCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, row, x, y, width, height, isSelected, theme } = ctx

    // 获取状态信息
    const state = row.state as QBTorrentState
    const stateInfo = qbStateIconMap[state]
    const iconColor = stateInfo ? stateInfo.color : theme.textColor3

    // 图标参数
    const iconSize = 16 // 图标大小
    const iconMargin = 12 // 左边距
    const iconSpacing = 8 // 图标和文字之间的间距

    // 计算图标位置
    const iconX = x + iconMargin
    const iconY = y + (height - iconSize) / 2 // 垂直居中

    // 获取图标 Data URL
    const iconUrl = getIconDataUrl(state, iconColor)

    // 创建图标图片元素
    const iconImage = new Image({
      url: iconUrl,
      x: iconX,
      y: iconY,
      width: iconSize,
      height: iconSize
    })
    leaferGroup.add(iconImage)

    // 文本内容处理
    const textValue = value?.toString() ?? ''

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 计算文本位置（图标之后）
    const textX = x + iconMargin + iconSize + iconSpacing
    const textWidth = width - iconMargin - iconSize - iconSpacing - 12 // 右边距12

    // 创建文本元素
    const textElement = new Text({
      text: textValue,
      x: textX,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
      verticalAlign: 'middle',
      textWrap: 'none',
      width: textWidth,
      height: height,
      overflow: 'hide' as any,
      textOverflow: 'ellipsis'
    } as any)

    leaferGroup.add(textElement)
  }
}
