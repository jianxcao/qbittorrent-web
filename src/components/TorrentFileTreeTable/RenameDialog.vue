<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="node?.isFolder ? t('torrentDetail.content.renameFolder') : t('torrentDetail.content.rename')"
    :positive-text="t('common.confirm')"
    :negative-text="t('common.cancel')"
    :loading="loading"
    @positive-click="handleConfirm"
  >
    <div class="rename-dialog-content">
      <div class="form-item">
        <div class="label">{{ t('torrentDetail.content.original') }}:</div>
        <div class="value">{{ oldName }}</div>
      </div>

      <div class="form-item">
        <div class="label">
          {{ node?.isFolder ? t('torrentDetail.content.folderName') : t('torrentDetail.content.name') }}:
        </div>
        <n-input
          v-model:value="newName"
          :placeholder="node?.isFolder ? t('torrentDetail.content.folderName') : t('torrentDetail.content.name')"
          clearable
          @keyup.enter="handleConfirm"
        />
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NModal, NInput, useMessage } from 'naive-ui'
import { useI18n } from '@/composables/useI18n'
import { renameFile, renameFolder } from '@/api/modules/torrents'
import type { FileNode, FolderNode } from '@/utils/file-tree'

const props = defineProps<{
  show: boolean
  node: FileNode | FolderNode | null
  hash: string
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18n()
const message = useMessage()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const newName = ref('')
const loading = ref(false)

// 旧名称（仅文件名部分，不含路径）
const oldName = computed(() => {
  if (!props.node) {
    return ''
  }
  return props.node.name
})

// 监听 node 变化，更新新名称
watch(
  () => props.node,
  (node) => {
    if (node) {
      newName.value = node.name
    }
  },
  { immediate: true }
)

/**
 * 处理确认重命名
 */
const handleConfirm = async () => {
  if (!props.node || !newName.value.trim()) {
    message.warning(t('common.inputRequired'))
    return false
  }

  // 如果名称没有变化，直接关闭
  if (newName.value === oldName.value) {
    showModal.value = false
    return true
  }

  loading.value = true

  try {
    const oldPath = props.node.path
    const pathParts = oldPath.split('/')
    pathParts[pathParts.length - 1] = newName.value.trim()
    const newPath = pathParts.join('/')
    console.debug('rename files or folders', oldPath, newPath)
    if (props.node.isFolder) {
      await renameFolder(props.hash, oldPath, newPath)
    } else {
      await renameFile(props.hash, oldPath, newPath)
    }

    message.success(t('torrentDetail.content.renameSuccess'))
    showModal.value = false
    emit('success')
    return true
  } catch (error: any) {
    console.error('Failed to rename:', error)
    message.error(error?.message || t('torrentDetail.content.renameFailed'))
    return false
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.rename-dialog-content {
  padding: 16px 0;
}

.form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-1);
}

.value {
  padding: 8px 12px;
  background-color: var(--input-color-disabled);
  border-radius: 4px;
  font-size: 13px;
  color: var(--text-color-2);
  word-break: break-all;
}
</style>
