<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="labelWidth">
      <!-- 添加 Torrent 时 -->
      <n-divider title-placement="left">{{ $t('settings.downloads.addingTorrents.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.addingTorrents.contentLayout')">
        <n-select v-model:value="settingStore.preferences.torrent_content_layout" :options="contentLayoutOptions" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.addingTorrents.addToTopOfQueue')">
        <n-checkbox v-model:checked="settingStore.preferences.add_to_top_of_queue" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.addingTorrents.dontAutoStart')">
        <n-checkbox v-model:checked="settingStore.preferences.add_stopped_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.addingTorrents.stopCondition')">
        <n-select v-model:value="settingStore.preferences.torrent_stop_condition" :options="stopConditionOptions" />
      </n-form-item>

      <!-- 当添加重复的 torrent 时 -->
      <n-divider title-placement="left">{{ $t('settings.downloads.duplicateTorrents.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.duplicateTorrents.mergeTrackers')">
        <n-checkbox v-model:checked="settingStore.preferences.merge_trackers" />
      </n-form-item>

      <!-- 其他设置 -->
      <n-divider title-placement="left">{{ $t('settings.downloads.fileManagement.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.fileManagement.deleteTorrentFiles')">
        <n-checkbox v-model:checked="autoDeleteTorrentFiles" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.fileManagement.preallocateAll')">
        <n-checkbox v-model:checked="settingStore.preferences.preallocate_all" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.fileManagement.incompleteFilesExt')">
        <n-checkbox v-model:checked="settingStore.preferences.incomplete_files_ext" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.fileManagement.useUnwantedFolder')">
        <n-checkbox v-model:checked="settingStore.preferences.use_unwanted_folder" />
      </n-form-item>

      <!-- 保存管理 -->
      <n-divider title-placement="left">{{ $t('settings.downloads.saveManagement.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.saveManagement.defaultTorrentManagementMode')">
        <n-select v-model:value="torrentManagementMode" :options="torrentManagementModeOptions" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.whenCategoryChanged')">
        <n-select
          v-model:value="categoryChangedAction"
          :options="categoryChangedActionOptions"
          :disabled="torrentManagementMode === 'manual'"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.whenDefaultSavePathChanged')">
        <n-select
          v-model:value="savePathChangedAction"
          :options="pathChangedActionOptions"
          :disabled="torrentManagementMode === 'manual'"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.whenCategorySavePathChanged')">
        <n-select
          v-model:value="categoryPathChangedAction"
          :options="pathChangedActionOptions"
          :disabled="torrentManagementMode === 'manual'"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.enableSubcategories')">
        <n-checkbox v-model:checked="settingStore.preferences.use_subcategories" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.useCategoryPathsInManualMode')">
        <n-checkbox v-model:checked="settingStore.preferences.use_category_paths_in_manual_mode" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.defaultSavePath')">
        <n-input
          v-model:value="settingStore.preferences.save_path"
          :placeholder="$t('settings.downloads.saveManagement.defaultSavePathPlaceholder')"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.saveIncompleteTo')">
        <div class="flex items-center gap-2 w-full">
          <n-checkbox v-model:checked="settingStore.preferences.temp_path_enabled" />
          <n-input
            v-model:value="settingStore.preferences.temp_path"
            :disabled="!settingStore.preferences.temp_path_enabled"
            :placeholder="$t('settings.downloads.saveManagement.saveIncompleteToPlaceholder')"
            class="flex-1"
          />
        </div>
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.copyTorrentFilesTo')">
        <div class="flex items-center gap-2 w-full">
          <n-checkbox v-model:checked="exportDirEnabled" />
          <n-input
            v-model:value="settingStore.preferences.export_dir"
            :disabled="!exportDirEnabled"
            :placeholder="$t('settings.downloads.saveManagement.pathPlaceholder')"
            class="flex-1"
          />
        </div>
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.saveManagement.copyCompletedTorrentFilesTo')">
        <div class="flex items-center gap-2 w-full">
          <n-checkbox v-model:checked="exportDirFinEnabled" />
          <n-input
            v-model:value="settingStore.preferences.export_dir_fin"
            :disabled="!exportDirFinEnabled"
            :placeholder="$t('settings.downloads.saveManagement.pathPlaceholder')"
            class="flex-1"
          />
        </div>
      </n-form-item>

      <!-- 自动从此处添加 torrent -->
      <n-divider title-placement="left">{{ $t('settings.downloads.autoAddTorrents.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.autoAddTorrents.monitoredFolders')" label-placement="top">
        <ScanDirsManager v-model="scanDirs" />
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.autoAddTorrents.excludedFileNames')" label-placement="top">
        <div class="w-full space-y-2">
          <n-checkbox v-model:checked="settingStore.preferences.excluded_file_names_enabled">{{
            $t('settings.downloads.autoAddTorrents.enableExcludedFileNames')
          }}</n-checkbox>
          <n-input
            v-model:value="settingStore.preferences.excluded_file_names"
            type="textarea"
            :disabled="!settingStore.preferences.excluded_file_names_enabled"
            :placeholder="$t('settings.downloads.autoAddTorrents.excludedFileNamesPlaceholder')"
            :autosize="{
              minRows: 3,
              maxRows: 8
            }"
          />
        </div>
      </n-form-item>

      <!-- 运行外部程序 -->
      <n-divider title-placement="left">{{ $t('settings.downloads.externalPrograms.title') }}</n-divider>

      <n-form-item :label="$t('settings.downloads.externalPrograms.runOnTorrentAdded')" label-placement="top">
        <div class="w-full space-y-2">
          <n-checkbox v-model:checked="settingStore.preferences.autorun_on_torrent_added_enabled">{{
            $t('settings.downloads.externalPrograms.runOnTorrentAddedEnable')
          }}</n-checkbox>
          <n-input
            v-model:value="settingStore.preferences.autorun_on_torrent_added_program"
            :disabled="!settingStore.preferences.autorun_on_torrent_added_enabled"
            :placeholder="$t('settings.downloads.externalPrograms.runOnTorrentAddedPlaceholder')"
          />
        </div>
      </n-form-item>

      <n-form-item :label="$t('settings.downloads.externalPrograms.runOnTorrentFinished')" label-placement="top">
        <div class="w-full space-y-2">
          <n-checkbox v-model:checked="settingStore.preferences.autorun_enabled">{{
            $t('settings.downloads.externalPrograms.runOnTorrentAddedEnable')
          }}</n-checkbox>
          <n-input
            v-model:value="settingStore.preferences.autorun_program"
            :disabled="!settingStore.preferences.autorun_enabled"
            :placeholder="$t('settings.downloads.externalPrograms.runOnTorrentFinishedPlaceholder')"
          />
          <n-text depth="3" style="font-size: 12px">
            <div>{{ $t('settings.downloads.externalPrograms.supportedParams') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramN') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramL') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramG') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramF') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramR') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramD') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramC') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramZ') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramT') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramI') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramJ') }}</div>
            <div>{{ $t('settings.downloads.externalPrograms.paramK') }}</div>
            <div class="mt-2">{{ $t('settings.downloads.externalPrograms.paramHint') }}</div>
          </n-text>
        </div>
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useTorrentOptions } from '@/composables/useTorrentOptions'
import ScanDirsManager from './ScanDirsManager.vue'

const settingStore = useSettingStore()
const isMobile = useIsSmallScreen()

// 使用公共的 Torrent 选项配置
const {
  torrentManagementModeOptions,
  contentLayoutOptions,
  stopConditionOptions,
  categoryChangedActionOptions,
  pathChangedActionOptions
} = useTorrentOptions()

const labelPlacement = computed(() => (isMobile.value ? 'top' : 'left'))
const labelWidth = computed(() => (isMobile.value ? 'auto' : 200))

// 自动删除 .torrent 文件（基于 auto_delete_mode）
const autoDeleteTorrentFiles = computed({
  get: () => (settingStore.preferences.auto_delete_mode ?? 0) > 0,
  set: (val: boolean) => {
    settingStore.preferences.auto_delete_mode = val ? 1 : 0
  }
})

// Torrent 管理模式
const torrentManagementMode = computed({
  get: () => (settingStore.preferences.auto_tmm_enabled ? 'automatic' : 'manual'),
  set: (val: string) => {
    settingStore.preferences.auto_tmm_enabled = val === 'automatic'
  }
})

// 分类修改时的行为
const categoryChangedAction = computed({
  get: () => (settingStore.preferences.category_changed_tmm_enabled ? 'relocate' : 'switch_to_manual'),
  set: (val: string) => {
    settingStore.preferences.category_changed_tmm_enabled = val === 'relocate'
  }
})

// 保存路径修改时的行为
const savePathChangedAction = computed({
  get: () => (settingStore.preferences.save_path_changed_tmm_enabled ? 'relocate' : 'switch_to_manual'),
  set: (val: string) => {
    settingStore.preferences.save_path_changed_tmm_enabled = val === 'relocate'
  }
})

// 分类路径修改时的行为
const categoryPathChangedAction = computed({
  get: () => (settingStore.preferences.torrent_changed_tmm_enabled ? 'relocate' : 'switch_to_manual'),
  set: (val: string) => {
    settingStore.preferences.torrent_changed_tmm_enabled = val === 'relocate'
  }
})

// 复制 .torrent 文件到（使用本地状态控制启用）
const exportDirEnabled = ref(!!settingStore.preferences.export_dir && settingStore.preferences.export_dir.length > 0)

watch(exportDirEnabled, (val) => {
  if (!val) {
    settingStore.preferences.export_dir = ''
  }
})

// 复制下载完成的 .torrent 文件到（使用本地状态控制启用）
const exportDirFinEnabled = ref(
  !!settingStore.preferences.export_dir_fin && settingStore.preferences.export_dir_fin.length > 0
)

watch(exportDirFinEnabled, (val) => {
  if (!val) {
    settingStore.preferences.export_dir_fin = ''
  }
})

// 监控文件夹
const scanDirs = computed({
  get: () => settingStore.preferences.scan_dirs || {},
  set: (val) => {
    settingStore.preferences.scan_dirs = val
  }
})
</script>

<style scoped>
:deep(.n-form-item-blank) {
  width: 100%;
}
</style>
