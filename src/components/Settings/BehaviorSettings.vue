<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="140">
      <n-divider title-placement="left">
        {{ $t('settings.behavior.logs.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.behavior.logs.enableFileLog')">
        <n-checkbox v-model:checked="settingStore.preferences.file_log_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.behavior.logs.logPath')">
        <n-input
          v-model:value="settingStore.preferences.file_log_path"
          :disabled="!settingStore.preferences.file_log_enabled"
          :placeholder="$t('settings.behavior.logs.logPathPlaceholder')"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.behavior.logs.backupLogs')">
        <n-checkbox
          v-model:checked="settingStore.preferences.file_log_backup_enabled"
          :disabled="!settingStore.preferences.file_log_enabled"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.behavior.logs.maxSize')">
        <n-input-number
          v-model:value="settingStore.preferences.file_log_max_size"
          :disabled="!settingStore.preferences.file_log_enabled || !settingStore.preferences.file_log_backup_enabled"
          :min="1"
          :step="1"
          style="width: 200px"
        >
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.behavior.logs.deleteOld')">
        <n-checkbox
          v-model:checked="settingStore.preferences.file_log_delete_old"
          :disabled="!settingStore.preferences.file_log_enabled"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.behavior.logs.deleteOldAge')">
        <n-input-number
          v-model:value="settingStore.preferences.file_log_age"
          :disabled="!settingStore.preferences.file_log_enabled || !settingStore.preferences.file_log_delete_old"
          :min="1"
          :step="1"
          style="width: 120px"
        />
        <n-select
          v-model:value="settingStore.preferences.file_log_age_type"
          :disabled="!settingStore.preferences.file_log_enabled || !settingStore.preferences.file_log_delete_old"
          :options="deleteOldTypeOptions"
          style="width: 120px; margin-left: 8px"
        />
      </n-form-item>

      <n-divider />

      <n-form-item :label="$t('settings.behavior.performanceWarning')">
        <n-checkbox v-model:checked="settingStore.preferences.performance_warning" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()
const settingStore = useSettingStore()
const isMobile = useIsSmallScreen()

const labelPlacement = computed(() => (isMobile.value ? 'top' : 'left'))

const deleteOldTypeOptions = computed(() => [
  { label: $t('settings.behavior.logs.deleteOldTypeDays'), value: 0 },
  { label: $t('settings.behavior.logs.deleteOldTypeMonths'), value: 1 },
  { label: $t('settings.behavior.logs.deleteOldTypeYears'), value: 2 }
])

// 确保 preferences 中有这些字段的默认值
onMounted(() => {
  if (settingStore.preferences.file_log_enabled === undefined) {
    settingStore.preferences.file_log_enabled = false
  }
  if (!settingStore.preferences.file_log_path) {
    settingStore.preferences.file_log_path = ''
  }
  if (settingStore.preferences.file_log_backup_enabled === undefined) {
    settingStore.preferences.file_log_backup_enabled = false
  }
  if (!settingStore.preferences.file_log_max_size) {
    settingStore.preferences.file_log_max_size = 65536
  }
  if (settingStore.preferences.file_log_delete_old === undefined) {
    settingStore.preferences.file_log_delete_old = true
  }
  if (!settingStore.preferences.file_log_age) {
    settingStore.preferences.file_log_age = 1
  }
  if (settingStore.preferences.file_log_age_type === undefined) {
    settingStore.preferences.file_log_age_type = 1
  }
  if (settingStore.preferences.performance_warning === undefined) {
    settingStore.preferences.performance_warning = true
  }
})
</script>
