import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'
import type { Torrent } from '@/api/types'

/**
 * Peer 数量单元格渲染器
 * 显示格式：连接数 (总数)
 * - 种子列：num_seeds (num_complete)
 * - 用户列：num_leechs (num_incomplete)
 * 参考 qBittorrent 官方实现：dynamicTable.js
 */
export class PeerCountCellRenderer implements CellRenderer {
  private type: 'seeds' | 'leeches'

  constructor(type: 'seeds' | 'leeches') {
    this.type = type
  }

  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { row, x, y, width, height, isSelected, theme } = ctx
    const torrent = row as Torrent

    // 获取连接数和总数
    let connected = 0
    let total = 0

    if (this.type === 'seeds') {
      // 种子：当前连接的种子数 (总种子数)
      connected = torrent.num_seeds || 0
      total = torrent.num_complete || 0
    } else {
      // 用户：当前连接的下载者数 (总下载者数)
      connected = torrent.num_leechs || 0
      total = torrent.num_incomplete || 0
    }

    // 格式化显示：connected (total)
    const formattedValue = `${connected} (${total})`

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 居中对齐显示
    const padding = 12

    // 创建文本元素
    const textElement = new Text({
      text: formattedValue,
      x: x + padding,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      width: width - padding * 2,
      height: height,
      overflow: 'hide' as any
    } as any)

    leaferGroup.add(textElement)
  }
}
