/**
 * 文件树数据结构
 * File Tree Data Structure
 *
 * 用于管理种子文件的树形结构，支持文件夹和文件的层级关系
 */

/**
 * 文件优先级枚举
 */
export enum FilePriority {
  Ignored = 0, // 不下载
  Normal = 1, // 正常
  High = 6, // 较高
  Maximum = 7, // 最高
  Mixed = -1 // 混合（仅用于文件夹，表示子文件优先级不一致）
}

/**
 * 三态复选框状态
 */
export enum TriState {
  Unchecked = 0, // 未选中
  Checked = 1, // 已选中
  Partial = 2 // 部分选中（仅用于文件夹）
}

/**
 * 文件节点基类
 */
export class FileNode {
  name: string = '' // 文件/文件夹名称
  path: string = '' // 完整路径
  rowId: number = 0 // 行 ID（用于表格渲染）
  fileId: number = 0 // 文件 ID（API 中的 index）
  size: number = 0 // 文件大小
  checked: TriState = TriState.Unchecked // 复选框状态
  remaining: number = 0 // 剩余大小
  progress: number = 0 // 下载进度 (0-100)
  priority: FilePriority = FilePriority.Normal // 优先级
  availability: number = 0 // 可用性
  depth: number = 0 // 树深度
  parent: FolderNode | null = null // 父节点
  isFolder: boolean = false // 是否为文件夹

  /**
   * 文件是否被忽略（不下载）
   */
  isIgnored(): boolean {
    return this.priority === FilePriority.Ignored
  }

  /**
   * 计算剩余大小
   */
  calculateRemaining(): void {
    this.remaining = this.isIgnored() ? 0 : this.size * (1 - this.progress / 100)
  }

  /**
   * 序列化节点数据
   */
  serialize(): Record<string, any> {
    return {
      name: this.name,
      path: this.path,
      fileId: this.fileId,
      size: this.size,
      checked: this.checked,
      remaining: this.remaining,
      progress: this.progress,
      priority: this.priority,
      availability: this.availability
    }
  }
}

/**
 * 文件夹节点类
 */
export class FolderNode extends FileNode {
  children: (FileNode | FolderNode)[] = [] // 子节点
  autoCalculateCheckedState: boolean = true // 是否自动计算复选框状态

  constructor() {
    super()
    this.isFolder = true
    this.fileId = -1 // 文件夹的 fileId 固定为 -1
  }

  /**
   * 添加子节点
   */
  addChild(node: FileNode | FolderNode): void {
    node.calculateRemaining()
    this.children.push(node)
  }

  /**
   * 计算文件夹及其子节点的大小、进度等属性
   * 使用栈实现后序遍历，确保先计算子节点再计算父节点
   */
  calculateSize(): void {
    const stack: FolderNode[] = [this]
    const visited: FolderNode[] = []

    while (stack.length > 0) {
      const root = stack[stack.length - 1]

      if (root.isFolder) {
        // 如果当前节点未访问过，先访问其子节点
        if (visited[visited.length - 1] !== root) {
          visited.push(root)
          // 将子节点中的文件夹压入栈
          for (const child of root.children) {
            if (child.isFolder) {
              stack.push(child as FolderNode)
            }
          }
          continue
        }

        visited.pop()

        // 处理当前文件夹节点，聚合子节点的属性
        root.size = 0
        root.remaining = 0
        root.progress = 0
        root.availability = 0
        root.checked = TriState.Unchecked
        root.priority = FilePriority.Normal
        let isFirstFile = true

        for (const child of root.children) {
          root.size += child.size

          if (isFirstFile) {
            root.priority = child.priority
            root.checked = child.checked
            isFirstFile = false
          } else {
            // 如果子节点优先级不同，设置为 Mixed
            if (root.priority !== child.priority) {
              root.priority = FilePriority.Mixed
            }
            // 如果子节点复选框状态不同，设置为 Partial
            if (root.checked !== child.checked) {
              root.checked = TriState.Partial
            }
          }

          // 计算进度和可用性（忽略被跳过的文件）
          if (!child.isIgnored()) {
            root.remaining += child.remaining
            root.progress += child.progress * child.size
            root.availability += child.availability * child.size
          }
        }

        // 根据是否自动计算复选框状态来设置
        root.checked = root.autoCalculateCheckedState ? root.checked : TriState.Checked
        // 计算平均进度和可用性
        root.progress = root.size > 0 ? root.progress / root.size : 0
        root.availability = root.size > 0 ? root.availability / root.size : 0
      }

      stack.pop()
    }
  }

  /**
   * 递归重新计算剩余大小
   * 当文件优先级变化时需要调用
   */
  calculateRemaining(): void {
    this.remaining = this.children.reduce((sum, node) => {
      node.calculateRemaining()
      return sum + node.remaining
    }, 0)
  }
}

/**
 * 文件树管理类
 */
export class FileTree {
  private root: FolderNode | null = null
  private nodeMap: Map<number, FileNode | FolderNode> = new Map()

  /**
   * 设置根节点并生成节点映射
   */
  setRoot(root: FolderNode): void {
    this.root = root
    this.generateNodeMap(root)

    if (this.root.isFolder) {
      this.root.calculateSize()
    }
  }

  /**
   * 获取根节点
   */
  getRoot(): FolderNode | null {
    return this.root
  }

  /**
   * 生成节点 ID 到节点的映射表
   * 用于快速查找节点
   */
  private generateNodeMap(root: FolderNode): void {
    this.nodeMap.clear()
    const stack: (FileNode | FolderNode)[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      // 不存储根节点
      if (node.parent !== null) {
        this.nodeMap.set(node.rowId, node)
      }

      if (node.isFolder) {
        stack.push(...(node as FolderNode).children)
      }
    }
  }

  /**
   * 根据 rowId 获取节点
   */
  getNode(rowId: number): FileNode | FolderNode | null {
    return this.nodeMap.get(rowId) || null
  }

  /**
   * 获取节点的 rowId
   */
  getRowId(node: FileNode | FolderNode): number {
    return node.rowId
  }

  /**
   * 将树转换为数组（深度优先遍历）
   * 返回所有节点的数组
   */
  toArray(): (FileNode | FolderNode)[] {
    if (!this.root) {
      return []
    }

    const result: (FileNode | FolderNode)[] = []
    const stack: (FileNode | FolderNode)[] = [...this.root.children].reverse()

    while (stack.length > 0) {
      const node = stack.pop()!
      result.push(node)

      if (node.isFolder) {
        // 反向压栈以保持正确的顺序
        stack.push(...[...(node as FolderNode).children].reverse())
      }
    }

    return result
  }
}

/**
 * 标准化优先级值
 */
export function normalizePriority(priority: number): FilePriority {
  switch (priority) {
    case FilePriority.Ignored:
    case FilePriority.Normal:
    case FilePriority.High:
    case FilePriority.Maximum:
    case FilePriority.Mixed:
      return priority
    default:
      return FilePriority.Normal
  }
}
