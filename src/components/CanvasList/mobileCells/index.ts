/**
 * 移动端 Cell 渲染器集合
 * 按照从上到下的顺序排列
 */

import { nameCellRenderer } from './NameCellRenderer'
import { uploadInfoCellRenderer } from './UploadInfoCellRenderer'
import { downloadInfoCellRenderer } from './DownloadInfoCellRenderer'
import { progressStatusCellRenderer } from './ProgressStatusCellRenderer'
import { dateInfoCellRenderer } from './DateInfoCellRenderer'

// 导出所有渲染器
export { nameCellRenderer } from './NameCellRenderer'
export { uploadInfoCellRenderer } from './UploadInfoCellRenderer'
export { downloadInfoCellRenderer } from './DownloadInfoCellRenderer'
export { progressStatusCellRenderer } from './ProgressStatusCellRenderer'
export { dateInfoCellRenderer } from './DateInfoCellRenderer'

// 导出类
export { NameCellRenderer } from './NameCellRenderer'
export { UploadInfoCellRenderer } from './UploadInfoCellRenderer'
export { DownloadInfoCellRenderer } from './DownloadInfoCellRenderer'
export { ProgressStatusCellRenderer } from './ProgressStatusCellRenderer'
export { DateInfoCellRenderer } from './DateInfoCellRenderer'

/**
 * 移动端 Cell 渲染器数组（按渲染顺序）
 */
export const mobileCellRenderers = [
  nameCellRenderer, // 第一行：名称 + 菜单按钮
  uploadInfoCellRenderer, // 第二行：上传信息
  downloadInfoCellRenderer, // 第三行：下载信息
  progressStatusCellRenderer, // 第四行：进度 + 状态
  dateInfoCellRenderer // 第五行：日期信息
]
