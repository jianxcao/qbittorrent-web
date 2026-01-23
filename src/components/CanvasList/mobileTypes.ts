import type { Torrent } from '@/api/types'
import type { ThemeCommonVars } from 'naive-ui'
import type { Group } from 'leafer-ui'

/**
 * 移动端 Cell 渲染上下文
 */
export interface MobileCellRenderContext {
  row: Torrent // 种子数据
  x: number // Cell 左上角 X 坐标
  y: number // Cell 左上角 Y 坐标
  width: number // Cell 宽度
  height: number // Cell 高度
  isSelected: boolean // 是否选中
  theme: ThemeCommonVars // 主题变量
}

/**
 * 移动端 Cell 渲染器接口
 */
export interface MobileCellRenderer {
  /**
   * 渲染 Cell
   * @param ctx 渲染上下文
   * @param group Leafer Group 容器
   */
  render(ctx: MobileCellRenderContext, group: Group): void

  /**
   * 计算 Cell 高度
   * @param ctx 渲染上下文（不包含 y 和 height）
   * @returns Cell 高度
   */
  calculateHeight(ctx: Omit<MobileCellRenderContext, 'y' | 'height'>): number
}
