<template>
  <div class="w-full space-y-2">
    <n-data-table :columns="scanDirsColumns" :data="scanDirsData" :single-line="false" :bordered="false" size="small" />
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <n-input
          v-model:value="newScanDir"
          :placeholder="$t('settings.downloads.scanDirs.monitoredFolderPlaceholder')"
          class="flex-1"
        />
        <n-select
          v-model:value="newScanDirMode"
          :options="scanDirModeOptions"
          style="width: 160px"
          @update:value="handleNewModeChange"
        />
      </div>
      <div v-if="newScanDirMode === 'custom'" class="flex gap-2">
        <n-input
          v-model:value="newScanDirCustomPath"
          :placeholder="$t('settings.downloads.scanDirs.customPathPlaceholder')"
          class="flex-1"
        />
      </div>
      <div>
        <n-button type="primary" @click="addScanDir">{{ $t('settings.downloads.scanDirs.addButton') }}</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NSelect, NInput, useMessage } from 'naive-ui'
import { useTorrentOptions } from '@/composables/useTorrentOptions'

interface Props {
  modelValue?: Record<string, number | string>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, number | string>): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const message = useMessage()
const { scanDirModeOptions } = useTorrentOptions()

// 监控文件夹数据
interface ScanDirRow {
  path: string
  modeValue: number | string
  modeLabel: string
  isEditing: boolean
}

const editingRow = ref<string | null>(null)
const editingMode = ref<number | string>(0)
const editingCustomPath = ref('')

const scanDirsData = computed<ScanDirRow[]>(() => {
  const scanDirs = props.modelValue || {}
  return Object.entries(scanDirs).map(([path, mode]) => ({
    path,
    modeValue: mode,
    modeLabel: getScanDirModeLabel(mode),
    isEditing: editingRow.value === path
  }))
})

const scanDirsColumns: DataTableColumns<ScanDirRow> = [
  {
    title: () => t('settings.downloads.scanDirs.monitoredFolder'),
    key: 'path',
    ellipsis: { tooltip: true }
  },
  {
    title: () => t('settings.downloads.scanDirs.saveLocation'),
    key: 'mode',
    width: 280,
    render: (row) => {
      if (row.isEditing) {
        const children = [
          h(NSelect, {
            value: editingMode.value,
            options: scanDirModeOptions.value,
            size: 'small',
            onUpdateValue: (val: number | string) => {
              editingMode.value = val
              if (val !== 'custom') {
                editingCustomPath.value = ''
              }
            }
          })
        ]

        if (editingMode.value === 'custom') {
          children.push(
            h(NInput, {
              value: editingCustomPath.value,
              placeholder: '输入自定义路径',
              size: 'small',
              onUpdateValue: (val: string) => {
                editingCustomPath.value = val
              }
            })
          )
        }

        return h('div', { class: 'flex flex-col gap-2' }, children)
      }
      return h('span', {}, row.modeLabel)
    }
  },
  {
    title: () => t('settings.downloads.scanDirs.actions'),
    key: 'actions',
    width: 160,
    render: (row) => {
      if (row.isEditing) {
        return h('div', { class: 'flex gap-2' }, [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => saveScanDir(row.path)
            },
            { default: () => t('settings.downloads.scanDirs.save') }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => cancelEdit()
            },
            { default: () => t('settings.downloads.scanDirs.cancel') }
          )
        ])
      }
      return h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            quaternary: true,
            onClick: () => editScanDir(row.path, row.modeValue)
          },
          { default: () => t('settings.downloads.scanDirs.edit') }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            quaternary: true,
            onClick: () => removeScanDir(row.path)
          },
          { default: () => t('settings.downloads.scanDirs.delete') }
        )
      ])
    }
  }
]

// 新增表单
const newScanDir = ref('')
const newScanDirMode = ref<number | string>(0)
const newScanDirCustomPath = ref('')

function getScanDirModeLabel(mode: number | string): string {
  if (mode === 0) {
    return t('settings.downloads.scanDirs.modeMonitoredFolder')
  }
  if (mode === 1) {
    return t('settings.downloads.scanDirs.modeDefaultSaveLocation')
  }
  return t('settings.downloads.scanDirs.customPathLabel', { path: mode })
}

function handleNewModeChange() {
  if (newScanDirMode.value !== 'custom') {
    newScanDirCustomPath.value = ''
  }
}

function updateValue(newValue: Record<string, number | string>) {
  emit('update:modelValue', { ...newValue })
}

function addScanDir() {
  if (!newScanDir.value.trim()) {
    message.warning(t('settings.downloads.scanDirs.pleaseInputPath'))
    return
  }

  let modeValue: number | string = 0
  if (newScanDirMode.value === 'custom') {
    if (!newScanDirCustomPath.value.trim()) {
      message.warning(t('settings.downloads.scanDirs.pleaseInputCustomPath'))
      return
    }
    modeValue = newScanDirCustomPath.value.trim()
  } else {
    modeValue = newScanDirMode.value as number
  }

  // 检查是否已存在
  if (props.modelValue[newScanDir.value]) {
    message.warning(t('settings.downloads.scanDirs.folderExists'))
    return
  }

  const newScanDirs = { ...props.modelValue }
  newScanDirs[newScanDir.value] = modeValue
  updateValue(newScanDirs)

  // 重置表单
  newScanDir.value = ''
  newScanDirMode.value = 0
  newScanDirCustomPath.value = ''

  message.success(t('settings.downloads.scanDirs.addSuccess'))
}

function editScanDir(path: string, currentMode: number | string) {
  editingRow.value = path
  if (typeof currentMode === 'string') {
    editingMode.value = 'custom'
    editingCustomPath.value = currentMode
  } else {
    editingMode.value = currentMode
    editingCustomPath.value = ''
  }
}

function saveScanDir(path: string) {
  let modeValue: number | string = 0
  if (editingMode.value === 'custom') {
    if (!editingCustomPath.value.trim()) {
      message.warning(t('settings.downloads.scanDirs.pleaseInputCustomPath'))
      return
    }
    modeValue = editingCustomPath.value.trim()
  } else {
    modeValue = editingMode.value as number
  }

  const newScanDirs = { ...props.modelValue }
  newScanDirs[path] = modeValue
  updateValue(newScanDirs)

  cancelEdit()
  message.success(t('settings.downloads.scanDirs.saveSuccess'))
}

function cancelEdit() {
  editingRow.value = null
  editingMode.value = 0
  editingCustomPath.value = ''
}

function removeScanDir(path: string) {
  const newScanDirs = { ...props.modelValue }
  delete newScanDirs[path]
  updateValue(newScanDirs)

  if (editingRow.value === path) {
    cancelEdit()
  }
  message.success(t('settings.downloads.scanDirs.deleteSuccess'))
}
</script>
