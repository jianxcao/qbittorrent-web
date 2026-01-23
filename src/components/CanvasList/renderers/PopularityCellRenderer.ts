import type { CellRenderer, CellRenderContext } from '../types'
import { Text } from 'leafer-ui'
import type { Group } from 'leafer-ui'

/**
 * 流行度单元格渲染器
 * 显示种子的流行度（popularity）
 * 参考官方qBittorrent实现：-1 显示为无穷符号，否则保留两位小数
 */
export class PopularityCellRenderer implements CellRenderer {
  render(ctx: CellRenderContext, leaferGroup: Group): void {
    const { value, x, y, width, height, isSelected, theme } = ctx

    // 格式化流行度值，参考官方实现
    // 官方: const popularity = (value === -1) ? "∞" : window.qBittorrent.Misc.toFixedPointString(value, 2);
    let formattedValue = '-'
    if (typeof value === 'number') {
      if (value === -1) {
        formattedValue = '∞'
      } else if (value >= 0) {
        formattedValue = value.toFixed(2)
      }
    }

    // 计算文本颜色（根据选中状态）
    const textColor = isSelected ? theme.textColor1 : theme.textColor2

    // 右对齐显示（与官方保持一致）
    const padding = 12

    // 创建文本元素
    const textElement = new Text({
      text: formattedValue,
      x: x + padding,
      y: y,
      fill: textColor,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'right',
      verticalAlign: 'middle',
      width: width - padding * 2,
      height: height,
      overflow: 'hide' as any
    } as any)

    leaferGroup.add(textElement)
  }
}

