import type { Torrent } from '@/store/torrentUtils'
import type { ThemeCommonVars } from 'naive-ui'
import type { Group } from 'leafer-ui'

/**
 * 单元格渲染上下文
 */
export interface CellRenderContext {
  value: any // 单元格值
  row: Torrent // 完整行数据
  columnKey: string // 列标识
  x: number // 单元格左上角 X 坐标
  y: number // 单元格左上角 Y 坐标
  width: number // 单元格宽度
  height: number // 单元格高度
  isSelected: boolean // 是否选中行
  theme: ThemeCommonVars // 主题颜色变量
}

/**
 * 单元格渲染器接口
 */
export interface CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void
}

/**
 * 渲染器配置选项
 */
export interface TextRendererOptions {
  ellipsis?: boolean // 是否显示省略号
  bold?: boolean // 是否加粗
  align?: 'left' | 'center' | 'right' // 对齐方式
}

export interface NumberRendererOptions {
  format?: 'size' | 'speed' | 'number' // 格式化类型
  align?: 'left' | 'center' | 'right' // 对齐方式
}

export interface DateRendererOptions {
  format?: string // 日期格式化字符串
}
