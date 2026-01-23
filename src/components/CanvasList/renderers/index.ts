import type { CellRenderer } from '../types'
import { TextCellRenderer } from './TextCellRenderer'
import { NameCellRenderer } from './NameCellRenderer'
import { ProgressCellRenderer } from './ProgressCellRenderer'
import { SizeCellRenderer } from './SizeCellRenderer'
import { SpeedCellRenderer } from './SpeedCellRenderer'
import { TimestampCellRenderer } from './TimestampCellRenderer'
import { RatioCellRenderer } from './RatioCellRenderer'
import { StateCellRenderer } from './StateCellRenderer'
import { DurationCellRenderer } from './DurationCellRenderer'
import { PopularityCellRenderer } from './PopularityCellRenderer'
import { AvailabilityCellRenderer } from './AvailabilityCellRenderer'
import { PeerCountCellRenderer } from './PeerCountCellRenderer'
import { CategoryCellRenderer } from './CategoryCellRenderer'
import { CheckboxCellRenderer } from './CheckboxCellRenderer'
import { PriorityCellRenderer } from './PriorityCellRenderer'

/**
 * 渲染器注册表
 * 根据列的 key 匹配对应的渲染器
 */
export const CELL_RENDERERS: Record<string, CellRenderer> = {
  // Checkbox 列
  checkbox: new CheckboxCellRenderer(),

  // 名称列 - 带状态图标
  name: new NameCellRenderer(),

  // 进度列 - 进度条渲染
  progress: new ProgressCellRenderer(),

  // 大小相关列 - 使用 SizeCellRenderer 格式化
  size: new SizeCellRenderer(),
  total_size: new SizeCellRenderer(),
  completed: new SizeCellRenderer(),
  downloaded: new SizeCellRenderer(),
  uploaded: new SizeCellRenderer(),
  downloaded_session: new SizeCellRenderer(),
  uploaded_session: new SizeCellRenderer(),
  amount_left: new SizeCellRenderer(),

  // 速度列 - 使用 SpeedCellRenderer 格式化
  dlspeed: new SpeedCellRenderer(),
  upspeed: new SpeedCellRenderer(),
  dl_limit: new SpeedCellRenderer(),
  up_limit: new SpeedCellRenderer(),

  // 状态列 - 使用 StateCellRenderer（多语言支持）
  state: new StateCellRenderer(),

  // 时间列 - 使用 TimestampCellRenderer 格式化
  added_on: new TimestampCellRenderer(),
  completion_on: new TimestampCellRenderer(),
  seen_complete: new TimestampCellRenderer(),

  // Peer 数量列 - 显示格式：连接数 (总数)
  num_seeds: new PeerCountCellRenderer('seeds'),
  num_leechs: new PeerCountCellRenderer('leeches'),

  // 时长列 - 使用 DurationCellRenderer 格式化时长（ETA、活动时间等）
  eta: new DurationCellRenderer(),
  time_active: new DurationCellRenderer(),
  reannounce: new DurationCellRenderer(),
  last_activity: new DurationCellRenderer(),

  // 比率列 - 使用 RatioCellRenderer 格式化（-1 显示∞，否则保留2位小数）
  ratio: new RatioCellRenderer(),

  // 流行度列 - 使用 PopularityCellRenderer 格式化（-1 显示∞，否则保留2位小数）
  popularity: new PopularityCellRenderer(),

  // 可用性列 - 使用 AvailabilityCellRenderer 格式化（保留3位小数）
  availability: new AvailabilityCellRenderer(),

  // Category - 使用 tag 样式渲染
  category: new CategoryCellRenderer(),

  // 其他文本列 - 左对齐，支持溢出省略
  tags: new TextCellRenderer({ ellipsis: true, align: 'left' }),
  tracker: new TextCellRenderer({ ellipsis: true, align: 'left' }),
  save_path: new TextCellRenderer({ ellipsis: true, align: 'left' }),
  content_path: new TextCellRenderer({ ellipsis: true, align: 'left' }),

  // 数字列 - 右对齐
  priority: new PriorityCellRenderer(),
  max_ratio: new RatioCellRenderer(),

  // 默认渲染器
  default: new TextCellRenderer({ ellipsis: true, align: 'left' })
}

/**
 * 获取列对应的渲染器
 * @param columnKey 列标识
 * @returns 渲染器实例
 */
export function getCellRenderer(columnKey: string): CellRenderer {
  return CELL_RENDERERS[columnKey] || CELL_RENDERERS.default
}

// 导出渲染器类，方便扩展
export { TextCellRenderer } from './TextCellRenderer'
export { NameCellRenderer } from './NameCellRenderer'
export { ProgressCellRenderer } from './ProgressCellRenderer'
export { SizeCellRenderer } from './SizeCellRenderer'
export { SpeedCellRenderer } from './SpeedCellRenderer'
export { TimestampCellRenderer } from './TimestampCellRenderer'
export { RatioCellRenderer } from './RatioCellRenderer'
export { StateCellRenderer } from './StateCellRenderer'
export { DurationCellRenderer } from './DurationCellRenderer'
export { PopularityCellRenderer } from './PopularityCellRenderer'
export { AvailabilityCellRenderer } from './AvailabilityCellRenderer'
export { PeerCountCellRenderer } from './PeerCountCellRenderer'
export { CategoryCellRenderer } from './CategoryCellRenderer'
export { CheckboxCellRenderer } from './CheckboxCellRenderer'
export { PriorityCellRenderer } from './PriorityCellRenderer'
