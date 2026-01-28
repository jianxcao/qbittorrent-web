<template>
  <div ref="tableContainerRef" class="file-tree-table h-full">
    <!-- 滚动容器 -->
    <div ref="tableBodyRef" class="table-scroll-container">
      <!-- 表头 -->
      <div class="table-header" :style="{ gridTemplateColumns, minWidth: tableMinWidth }">
        <div class="header-cell checkbox-cell">
          <n-checkbox
            :checked="globalCheckState.checked"
            :indeterminate="globalCheckState.indeterminate"
            @update:checked="handleGlobalCheckChange"
          />
        </div>
        <div class="header-cell name-cell">
          <span>{{ t('torrentDetail.content.name') }}</span>
          <ResizeLine
            v-model:container-width="columnWidths[0]"
            :min-container-width="120"
            :max-container-width="600"
            :line-width="3"
            class="column-resizer"
            @update:container-width="onColumnResize(0)"
          />
        </div>
        <div class="header-cell size-cell">
          <span>{{ t('torrentDetail.content.size') }}</span>
          <ResizeLine
            v-model:container-width="columnWidths[1]"
            :min-container-width="80"
            :max-container-width="200"
            :line-width="3"
            class="column-resizer"
            @update:container-width="onColumnResize(1)"
          />
        </div>
        <div class="header-cell progress-cell">
          <span>{{ t('torrentDetail.content.progress') }}</span>
          <ResizeLine
            v-model:container-width="columnWidths[2]"
            :min-container-width="100"
            :max-container-width="300"
            :line-width="3"
            class="column-resizer"
            @update:container-width="onColumnResize(2)"
          />
        </div>
        <div class="header-cell priority-cell">
          <span>{{ t('torrentDetail.content.priority') }}</span>
          <ResizeLine
            v-model:container-width="columnWidths[3]"
            :min-container-width="100"
            :max-container-width="200"
            :line-width="3"
            class="column-resizer"
            @update:container-width="onColumnResize(3)"
          />
        </div>
        <div class="header-cell remaining-cell">
          <span>{{ t('torrentDetail.content.remaining') }}</span>
          <ResizeLine
            v-model:container-width="columnWidths[4]"
            :min-container-width="80"
            :max-container-width="200"
            :line-width="3"
            class="column-resizer"
            @update:container-width="onColumnResize(4)"
          />
        </div>
        <div class="header-cell availability-cell">
          <span>{{ t('torrentDetail.content.availability') }}</span>
        </div>
      </div>

      <!-- 表体内容 -->
      <div class="table-content" :style="{ minWidth: tableMinWidth }">
        <div
          v-for="node in visibleNodes"
          :key="node.rowId"
          class="table-row"
          :style="{ gridTemplateColumns }"
          @contextmenu.prevent="handleRowContextMenu(node, $event)"
        >
          <!-- 复选框列 -->
          <div class="table-cell checkbox-cell">
            <n-checkbox
              :checked="node.checked === TriState.Checked"
              :indeterminate="node.checked === TriState.Partial"
              @update:checked="(checked) => handleCheckboxChange(node, checked)"
            />
          </div>

          <!-- 名称列 -->
          <div class="table-cell name-cell">
            <div class="name-content" :style="{ marginLeft: `${node.depth * 16}px` }">
              <!-- 折叠图标 -->
              <n-icon
                v-if="node.isFolder"
                class="collapse-icon"
                :class="{ collapsed: isCollapsed(node.rowId) }"
                size="16"
                @click.stop="toggleCollapse(node.rowId)"
              >
                <ChevronDownIcon />
              </n-icon>
              <span v-else class="icon-placeholder"></span>

              <!-- 文件夹/文件图标 -->
              <n-icon v-if="node.isFolder" class="folder-icon" size="16">
                <FolderIcon />
              </n-icon>
              <n-icon v-else class="file-icon" size="16">
                <DocumentIcon />
              </n-icon>

              <!-- 文件名 -->
              <span class="file-name" :title="node.name">{{ node.name }}</span>
            </div>
          </div>

          <!-- 大小列 -->
          <div class="table-cell size-cell">
            {{ formatSize(node.size) }}
          </div>

          <!-- 进度列 -->
          <div class="table-cell progress-cell">
            <n-progress
              type="line"
              :percentage="Number(node.progress.toFixed(2))"
              :show-indicator="false"
              :height="6"
              :color="themeVars.primaryColor"
              :rail-color="changeColor(themeVars.primaryColor, { alpha: 0.2 })"
            />
            <span class="progress-text">{{ node.progress.toFixed(1) }}%</span>
          </div>

          <!-- 优先级列 -->
          <div class="table-cell priority-cell">
            <n-select
              :value="node.priority"
              :options="priorityOptions"
              :disabled="node.priority === FilePriority.Mixed"
              size="small"
              @update:value="(value) => handlePriorityChange(node, value)"
            />
          </div>

          <!-- 剩余列 -->
          <div class="table-cell remaining-cell">
            {{ formatSize(node.remaining) }}
          </div>

          <!-- 可用性列 -->
          <div class="table-cell availability-cell">
            {{ node.availability.toFixed(3) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="contextMenuOptions"
      :show="showContextMenu"
      :on-clickoutside="handleClickOutside"
      @select="handleContextMenuSelect"
    />

    <!-- 重命名对话框 -->
    <RenameDialog v-model:show="showRenameDialog" :node="currentNode" :hash="hash" @success="handleRenameSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NCheckbox, NProgress, NSelect, NIcon, NDropdown, useThemeVars, useMessage } from 'naive-ui'
import { ChevronDown as ChevronDownIcon, Folder as FolderIcon, Document as DocumentIcon } from '@vicons/ionicons5'
import { changeColor } from 'seemly'
import { useResizeObserver } from '@vueuse/core'
import { useI18n } from '@/composables/useI18n'
import { useFileTree } from '@/composables/useFileTree'
import { formatSize } from '@/utils'
import { setFilePriority } from '@/api/modules/torrents'
import { FilePriority, TriState, type FileNode, type FolderNode } from '@/utils/file-tree'
import type { TorrentFile } from '@/api/types'
import ResizeLine from '@/components/ResizeLine.vue'
import RenameDialog from './RenameDialog.vue'

const props = defineProps<{
  files: TorrentFile[]
  hash: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { t } = useI18n()
const message = useMessage()
const themeVars = useThemeVars()

const { fileTree, buildTree, isCollapsed, toggleCollapse, getVisibleNodes, getAllFileIds } = useFileTree()

// 树根节点
const rootNode = ref<FolderNode | null>(null)

// 可见节点列表
const visibleNodes = computed(() => {
  return getVisibleNodes(rootNode.value)
})

// 容器宽度监听
const tableContainerRef = ref<HTMLElement | null>(null)
const tableWidth = ref(0)

useResizeObserver(tableContainerRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    tableWidth.value = entry.contentRect.width
  }
})

// 列宽度管理
const columnWidths = ref<number[]>([])
const manualWidthKeys = ref<Set<number>>(new Set())

// 列配置：[minWidth, defaultWidth]
const columnConfigs = [
  { key: 'name', minWidth: 120, defaultWidth: 0 }, // 名称列自适应
  { key: 'size', minWidth: 80, defaultWidth: 100 },
  { key: 'progress', minWidth: 100, defaultWidth: 150 },
  { key: 'priority', minWidth: 100, defaultWidth: 140 },
  { key: 'remaining', minWidth: 80, defaultWidth: 100 },
  { key: 'availability', minWidth: 60, defaultWidth: 80 }
]

// 监听容器宽度变化，计算列宽
watch(
  () => tableWidth.value,
  (width) => {
    if (width === 0) {
      return
    }

    const checkboxWidth = 50
    const availableWidth = Math.max(0, width - checkboxWidth)

    const nextWidths: number[] = []
    let fixedWidth = 0
    const flexibleIndexes: number[] = []

    columnConfigs.forEach((config, index) => {
      const currentWidth = columnWidths.value[index]
      const isManual = manualWidthKeys.value.has(index)

      // 如果用户手动调整过，保持用户设置的宽度
      if (isManual && typeof currentWidth === 'number') {
        nextWidths[index] = Math.max(config.minWidth, currentWidth)
        fixedWidth += nextWidths[index]
      } else if (config.defaultWidth > 0) {
        // 有默认宽度的列
        nextWidths[index] = Math.max(config.minWidth, config.defaultWidth)
        fixedWidth += nextWidths[index]
      } else {
        // 自适应列（名称列）
        flexibleIndexes.push(index)
      }
    })

    // 分配剩余空间给自适应列
    const remainingWidth = Math.max(0, availableWidth - fixedWidth)
    const flexWidth = flexibleIndexes.length > 0 ? remainingWidth / flexibleIndexes.length : 0

    flexibleIndexes.forEach((index) => {
      nextWidths[index] = Math.max(columnConfigs[index].minWidth, flexWidth)
    })

    columnWidths.value = nextWidths
  },
  { immediate: true }
)

// 表格列配置
const gridTemplateColumns = computed(() => {
  const columns = columnWidths.value.map((width) => `${width}px`)
  return `50px ${columns.join(' ')}`
})

// 计算表格最小宽度
const tableMinWidth = computed(() => {
  const checkboxWidth = 50
  const columnsWidth = columnWidths.value.reduce((total, width) => total + width, 0)
  return `${checkboxWidth + columnsWidth}px`
})

/**
 * 处理列宽度调整
 */
const onColumnResize = (index: number) => {
  manualWidthKeys.value.add(index)
}

// 优先级选项
const priorityOptions = computed(() => [
  { label: t('torrentDetail.content.priorityIgnored'), value: FilePriority.Ignored },
  { label: t('torrentDetail.content.priorityNormal'), value: FilePriority.Normal },
  { label: t('torrentDetail.content.priorityHigh'), value: FilePriority.High },
  { label: t('torrentDetail.content.priorityMaximum'), value: FilePriority.Maximum },
  { label: t('torrentDetail.content.priorityMixed'), value: FilePriority.Mixed, disabled: true }
])

// 全局复选框状态
const globalCheckState = computed(() => {
  if (!rootNode.value || rootNode.value.children.length === 0) {
    return { checked: false, indeterminate: false }
  }

  const allNodes = fileTree.toArray()
  const allChecked = allNodes.every((node) => node.checked === TriState.Checked)
  const allUnchecked = allNodes.every((node) => node.checked === TriState.Unchecked)

  if (allChecked) {
    return { checked: true, indeterminate: false }
  }
  if (allUnchecked) {
    return { checked: false, indeterminate: false }
  }
  return { checked: false, indeterminate: true }
})

// 右键菜单相关
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentNode = ref<FileNode | FolderNode | null>(null)

const contextMenuOptions = computed(() => [
  {
    label: t('torrentDetail.content.rename'),
    key: 'rename'
  }
])

// 重命名对话框
const showRenameDialog = ref(false)

// 监听 files 变化，重新构建树
watch(
  () => props.files,
  (newFiles) => {
    if (newFiles && newFiles.length > 0) {
      rootNode.value = buildTree(newFiles)
    } else {
      rootNode.value = null
    }
  },
  { immediate: true }
)

// 表格主体引用
const tableBodyRef = ref<HTMLElement | null>(null)

/**
 * 处理全局复选框变化
 */
const handleGlobalCheckChange = async (checked: boolean) => {
  if (!rootNode.value) {
    return
  }

  const priority = checked ? FilePriority.Normal : FilePriority.Ignored
  const allNodes = fileTree.toArray()
  const fileIds = allNodes.filter((node) => !node.isFolder).map((node) => node.fileId)

  try {
    await setFilePriority(props.hash, fileIds, priority as 0 | 1 | 6 | 7)
    message.success(t('torrentDetail.content.priorityChangeSuccess'))
    emit('refresh')
  } catch (error) {
    console.error('Failed to change global priority:', error)
    message.error(t('torrentDetail.content.priorityChangeFailed'))
  }
}

/**
 * 处理单个节点复选框变化
 */
const handleCheckboxChange = async (node: FileNode | FolderNode, checked: boolean) => {
  const priority = checked ? FilePriority.Normal : FilePriority.Ignored
  const fileIds = getAllFileIds(node)

  try {
    await setFilePriority(props.hash, fileIds, priority as 0 | 1 | 6 | 7)
    message.success(t('torrentDetail.content.priorityChangeSuccess'))
    emit('refresh')
  } catch (error) {
    console.error('Failed to change file priority:', error)
    message.error(t('torrentDetail.content.priorityChangeFailed'))
  }
}

/**
 * 处理优先级变化
 */
const handlePriorityChange = async (node: FileNode | FolderNode, priority: FilePriority) => {
  // Mixed 状态不应该被设置，它只是一个显示状态
  if (priority === FilePriority.Mixed) {
    return
  }

  const fileIds = getAllFileIds(node)

  try {
    await setFilePriority(props.hash, fileIds, priority as 0 | 1 | 6 | 7)
    message.success(t('torrentDetail.content.priorityChangeSuccess'))
    emit('refresh')
  } catch (error) {
    console.error('Failed to change file priority:', error)
    message.error(t('torrentDetail.content.priorityChangeFailed'))
  }
}

/**
 * 处理右键菜单
 */
const handleRowContextMenu = (node: FileNode | FolderNode, event: MouseEvent) => {
  currentNode.value = node
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

/**
 * 关闭右键菜单
 */
const handleClickOutside = () => {
  showContextMenu.value = false
}

/**
 * 处理右键菜单选择
 */
const handleContextMenuSelect = (key: string) => {
  showContextMenu.value = false

  if (key === 'rename') {
    showRenameDialog.value = true
  }
}

/**
 * 处理重命名成功
 */
const handleRenameSuccess = () => {
  emit('refresh')
}
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';

.file-tree-table {
  color: var(--text-color-2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-scroll-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  .scrollbar();
}

.table-header {
  display: grid;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  user-select: none;
  background-color: var(--table-color);
  border-bottom: 1px solid var(--border-color);
  min-height: 32px;
}

.header-cell {
  position: relative;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
  display: flex;
  align-items: center;
  border-right: 1px solid var(--border-color);
  min-width: 0;

  &:last-child {
    border-right: none;
  }
}

.column-resizer {
  position: absolute;
  right: -2px;
  top: 0;
  height: 100%;
}

.table-row {
  display: grid;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  min-height: 28px;

  &:nth-child(odd) {
    background-color: color-mix(in srgb, var(--table-color-striped) 50%, transparent);
  }

  &:hover {
    background-color: var(--table-color-hover);
  }
}

.table-cell {
  padding: 4px 8px;
  min-width: 0;
  display: flex;
  align-items: center;
  font-size: 13px;
}

.checkbox-cell {
  justify-content: center;
}

.name-cell {
  overflow: hidden;
}

.name-content {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.collapse-icon {
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.collapsed {
    transform: rotate(-90deg);
  }

  &:hover {
    color: var(--primary-color);
  }
}

.icon-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.folder-icon {
  color: var(--warning-color);
  flex-shrink: 0;
}

.file-icon {
  color: var(--text-color-3);
  flex-shrink: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-cell,
.remaining-cell {
  justify-content: flex-end;
}

.progress-cell {
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: var(--text-color-3);
  white-space: nowrap;
}

.availability-cell {
  justify-content: flex-end;
  font-family: monospace;
}
</style>
