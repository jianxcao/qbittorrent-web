/**
 * 文件树 Composable
 * File Tree Composable
 *
 * 负责将 API 返回的文件列表转换为树形结构，并管理树的状态
 */

import { ref } from 'vue'
import type { TorrentFile } from '@/api/types'
import {
  FileTree,
  FolderNode,
  FileNode,
  FilePriority,
  TriState,
  normalizePriority
} from '@/utils/file-tree'

/**
 * 路径分隔符（跨平台兼容）
 */
const PATH_SEPARATOR = '/'


/**
 * 文件树 Hook
 */
export function useFileTree() {
  // 文件树实例
  const fileTree = new FileTree()

  // 折叠状态管理 Map<path, collapsed>
  // 使用 path 作为 key，这样在树重建时可以保持用户的折叠状态
  const collapseStateByPath = ref<Map<string, boolean>>(new Map())

  // rowId 到 path 的映射，用于快速查找
  const rowIdToPath = ref<Map<number, string>>(new Map())

  /**
   * 从 TorrentFile 数组构建树形结构
   */
  const buildTree = (files: TorrentFile[]): FolderNode => {
    let rowId = 0
    const rootNode = new FolderNode()
    rootNode.name = ''
    rootNode.path = ''
    rootNode.rowId = -1

    // 清空 rowId 映射（每次重建都会变化）
    rowIdToPath.value.clear()

    for (const file of files) {
      const pathItems = file.name.split(PATH_SEPARATOR)
      const fileName = pathItems.pop() || '' // 移除最后一项（文件名）

      // 从根节点开始，逐层创建或查找文件夹节点
      let parent = rootNode
      for (const folderName of pathItems) {
        if (folderName === '.unwanted') {
          continue
        }

        // 查找是否已存在该文件夹节点
        let folderNode: FolderNode | null = null
        for (const child of parent.children) {
          if (child.isFolder && child.name === folderName) {
            folderNode = child as FolderNode
            break
          }
        }

        // 如果不存在，创建新的文件夹节点
        if (folderNode === null) {
          folderNode = new FolderNode()
          folderNode.path = parent.path === '' ? folderName : `${parent.path}${PATH_SEPARATOR}${folderName}`
          folderNode.name = folderName
          folderNode.rowId = rowId
          folderNode.parent = parent
          parent.addChild(folderNode)

          // 记录 rowId 到 path 的映射
          rowIdToPath.value.set(rowId, folderNode.path)

          rowId += 1
        } else {
          // 更新已存在节点的 rowId 映射
          rowIdToPath.value.set(folderNode.rowId, folderNode.path)
        }

        parent = folderNode
      }

      // 创建文件节点
      const checked = file.priority === FilePriority.Ignored ? TriState.Unchecked : TriState.Checked
      const fileNode = new FileNode()
      fileNode.name = fileName
      fileNode.path = file.name
      fileNode.rowId = rowId
      fileNode.fileId = file.index
      fileNode.size = file.size
      fileNode.checked = checked
      fileNode.progress = file.progress * 100 // API 返回 0-1，转换为 0-100
      fileNode.priority = normalizePriority(file.priority)
      fileNode.availability = file.availability
      fileNode.parent = parent
      parent.addChild(fileNode)

      rowId += 1
    }

    // 设置树的根节点并计算聚合属性
    fileTree.setRoot(rootNode)

    // 初始化折叠状态（默认全部展开顶层，折叠其他层）
    initializeCollapseState(rootNode)

    return rootNode
  }

  /**
   * 初始化折叠状态
   * 只为新文件夹设置默认状态，保留已有的用户操作
   * 默认展开第一层，折叠其他层
   */
  const initializeCollapseState = (root: FolderNode): void => {
    const stack: FolderNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      for (const child of node.children) {
        if (child.isFolder) {
          const folder = child as FolderNode
          const path = folder.path

          // 如果这个路径还没有折叠状态（新文件夹），则设置默认状态
          if (!collapseStateByPath.value.has(path)) {
            const depth = calculateDepth(folder)
            // 第一层展开（depth === 0），其他层折叠
            collapseStateByPath.value.set(path, depth >= 1)
          }

          stack.push(folder)
        }
      }
    }
  }

  /**
   * 计算节点深度
   */
  const calculateDepth = (node: FileNode | FolderNode): number => {
    let depth = 0
    let current = node.parent
    while (current && current.parent !== null) {
      depth += 1
      current = current.parent
    }
    return depth
  }

  /**
   * 判断节点是否折叠
   */
  const isCollapsed = (rowId: number | undefined): boolean => {
    if (rowId === undefined || rowId === null) {
      return false
    }
    const path = rowIdToPath.value.get(rowId)
    if (!path) {
      return false
    }
    return collapseStateByPath.value.get(path) ?? false
  }

  /**
   * 展开节点
   */
  const expandNode = (rowId: number): void => {
    const path = rowIdToPath.value.get(rowId)
    if (path) {
      collapseStateByPath.value.set(path, false)
    }
  }

  /**
   * 折叠节点
   */
  const collapseNode = (rowId: number): void => {
    const path = rowIdToPath.value.get(rowId)
    if (path) {
      collapseStateByPath.value.set(path, true)
    }
  }

  /**
   * 切换节点折叠状态
   */
  const toggleCollapse = (rowId: number): void => {
    if (isCollapsed(rowId)) {
      expandNode(rowId)
    } else {
      collapseNode(rowId)
    }
  }

  /**
   * 展开所有节点
   */
  const expandAllNodes = (): void => {
    for (const [path, _] of collapseStateByPath.value) {
      collapseStateByPath.value.set(path, false)
    }
  }

  /**
   * 折叠所有节点（除了根节点的直接子节点）
   */
  const collapseAllNodes = (): void => {
    // 需要根据深度来判断，这里我们遍历当前的树来计算
    const root = fileTree.getRoot()
    if (!root) {
      return
    }

    const stack: FolderNode[] = [root]
    while (stack.length > 0) {
      const node = stack.pop()!
      for (const child of node.children) {
        if (child.isFolder) {
          const folder = child as FolderNode
          const depth = calculateDepth(folder)
          // 第一层保持展开，其他层折叠
          if (depth >= 1) {
            collapseStateByPath.value.set(folder.path, true)
          }
          stack.push(folder)
        }
      }
    }
  }

  /**
   * 获取所有可见节点（考虑折叠状态）
   */
  const getVisibleNodes = (root: FolderNode | null): (FileNode | FolderNode)[] => {
    if (!root) {
      return []
    }

    const result: (FileNode | FolderNode)[] = []
    const stack: { node: FileNode | FolderNode; depth: number }[] = []

    // 初始化栈，深度从 0 开始
    for (let i = root.children.length - 1; i >= 0; i -= 1) {
      stack.push({ node: root.children[i], depth: 0 })
    }

    while (stack.length > 0) {
      const { node, depth } = stack.pop()!
      node.depth = depth
      result.push(node)

      // 如果是文件夹且未折叠，将其子节点加入栈
      if (node.isFolder && !isCollapsed(node.rowId)) {
        const folder = node as FolderNode
        for (let i = folder.children.length - 1; i >= 0; i -= 1) {
          stack.push({ node: folder.children[i], depth: depth + 1 })
        }
      }
    }

    return result
  }

  /**
   * 递归获取节点及其所有子节点的文件 ID
   * 用于批量设置优先级
   * 注意：文件夹的 fileId 是 -1，会被 API 忽略
   */
  const getAllFileIds = (node: FileNode | FolderNode): number[] => {
    const fileIds: number[] = []

    // 如果当前节点是文件（不是文件夹），包含它自己
    if (!node.isFolder) {
      fileIds.push(node.fileId)
    }

    // 递归获取所有子节点的文件 ID
    const stack: (FileNode | FolderNode)[] = node.isFolder ? [...(node as FolderNode).children] : []

    while (stack.length > 0) {
      const current = stack.pop()!

      if (!current.isFolder) {
        fileIds.push(current.fileId)
      } else {
        const folder = current as FolderNode
        stack.push(...folder.children)
      }
    }

    return fileIds
  }

  /**
   * 递归获取节点的所有子节点的 rowId
   */
  const getAllRowIds = (node: FileNode | FolderNode): number[] => {
    const rowIds: number[] = [node.rowId]
    const stack: (FileNode | FolderNode)[] = []

    if (node.isFolder) {
      stack.push(...(node as FolderNode).children)
    }

    while (stack.length > 0) {
      const current = stack.pop()!
      rowIds.push(current.rowId)

      if (current.isFolder) {
        stack.push(...(current as FolderNode).children)
      }
    }

    return rowIds
  }

  return {
    fileTree,
    collapseStateByPath,
    buildTree,
    isCollapsed,
    expandNode,
    collapseNode,
    toggleCollapse,
    expandAllNodes,
    collapseAllNodes,
    getVisibleNodes,
    getAllFileIds,
    getAllRowIds
  }
}
