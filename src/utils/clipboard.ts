/**
 * 跨平台复制文本到剪贴板
 * 解决iOS Safari中navigator.clipboard兼容性问题
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 优先使用现代的Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // 降级方案：使用传统的execCommand方法
    return fallbackCopyToClipboard(text)
  } catch (error) {
    console.warn('现代剪贴板API失败，尝试降级方案:', error)
    return fallbackCopyToClipboard(text)
  }
}

/**
 * 降级复制方案，兼容老版本浏览器和iOS Safari
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // 创建临时的textarea元素
    const textArea = document.createElement('textarea')
    textArea.value = text

    // 设置样式，使其不可见但仍可选择
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    textArea.style.pointerEvents = 'none'
    textArea.setAttribute('readonly', '')

    // 添加到DOM中
    document.body.appendChild(textArea)

    // 选择文本
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, text.length)

    // 尝试复制
    const successful = document.execCommand('copy')

    // 清理DOM
    document.body.removeChild(textArea)

    return successful
  } catch (error) {
    console.error('降级复制方案也失败了:', error)
    return false
  }
}

/**
 * 检查是否支持剪贴板API
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText)
}
