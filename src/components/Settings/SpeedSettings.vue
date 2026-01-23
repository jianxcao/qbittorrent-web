<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="180">
      <n-divider title-placement="left">
        {{ $t('settings.speed.globalLimits.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.speed.globalLimits.uploadLimit')">
        <n-input-number v-model:value="upLimitKiB" :min="0" style="width: 160px">
          <template #suffix>KiB/s</template>
        </n-input-number>
        <span style="margin-left: 8px; color: var(--n-text-color-disabled)">
          {{ $t('settings.speed.globalLimits.zeroUnlimited') }}
        </span>
      </n-form-item>

      <n-form-item :label="$t('settings.speed.globalLimits.downloadLimit')">
        <n-input-number v-model:value="dlLimitKiB" :min="0" style="width: 160px">
          <template #suffix>KiB/s</template>
        </n-input-number>
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.speed.alternativeLimits.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.speed.alternativeLimits.uploadLimit')">
        <n-input-number v-model:value="altUpLimitKiB" :min="0" style="width: 160px">
          <template #suffix>KiB/s</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.speed.alternativeLimits.downloadLimit')">
        <n-input-number v-model:value="altDlLimitKiB" :min="0" style="width: 160px">
          <template #suffix>KiB/s</template>
        </n-input-number>
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.speed.scheduler.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.speed.scheduler.enable')">
        <n-checkbox v-model:checked="settingStore.preferences.scheduler_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.scheduler_enabled">
        <n-form-item :label="$t('settings.speed.scheduler.fromTime')">
          <n-time-picker
            v-model:value="scheduleFromTime"
            format="HH:mm"
            :actions="null"
            style="width: 160px"
          />
        </n-form-item>

        <n-form-item :label="$t('settings.speed.scheduler.toTime')">
          <n-time-picker
            v-model:value="scheduleToTime"
            format="HH:mm"
            :actions="null"
            style="width: 160px"
          />
        </n-form-item>

        <n-form-item :label="$t('settings.speed.scheduler.days')">
          <n-select v-model:value="settingStore.preferences.scheduler_days" :options="schedulerDaysOptions" />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.speed.rateLimitSettings.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.speed.rateLimitSettings.limitUtpRate')">
        <n-checkbox v-model:checked="settingStore.preferences.limit_utp_rate" />
      </n-form-item>

      <n-form-item :label="$t('settings.speed.rateLimitSettings.limitTcpOverhead')">
        <n-checkbox v-model:checked="settingStore.preferences.limit_tcp_overhead" />
      </n-form-item>

      <n-form-item :label="$t('settings.speed.rateLimitSettings.limitLanPeers')">
        <n-checkbox v-model:checked="settingStore.preferences.limit_lan_peers" />
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

// 将字节/秒转换为 KiB/秒，用于显示和编辑
const upLimitKiB = computed({
  get: () => Math.floor((settingStore.preferences.up_limit || 0) / 1024),
  set: (val) => {
    settingStore.preferences.up_limit = val * 1024
  }
})

const dlLimitKiB = computed({
  get: () => Math.floor((settingStore.preferences.dl_limit || 0) / 1024),
  set: (val) => {
    settingStore.preferences.dl_limit = val * 1024
  }
})

const altUpLimitKiB = computed({
  get: () => Math.floor((settingStore.preferences.alt_up_limit || 0) / 1024),
  set: (val) => {
    settingStore.preferences.alt_up_limit = val * 1024
  }
})

const altDlLimitKiB = computed({
  get: () => Math.floor((settingStore.preferences.alt_dl_limit || 0) / 1024),
  set: (val) => {
    settingStore.preferences.alt_dl_limit = val * 1024
  }
})

// 时间选择器：小时和分钟转时间戳（毫秒）
// 使用本地时间避免时区问题
const scheduleFromTime = computed({
  get: () => {
    const hour = settingStore.preferences.schedule_from_hour ?? 0
    const min = settingStore.preferences.schedule_from_min ?? 0
    const date = new Date()
    date.setHours(hour, min, 0, 0)
    return date.getTime()
  },
  set: (val: number) => {
    const date = new Date(val)
    settingStore.preferences.schedule_from_hour = date.getHours()
    settingStore.preferences.schedule_from_min = date.getMinutes()
  }
})

const scheduleToTime = computed({
  get: () => {
    const hour = settingStore.preferences.schedule_to_hour ?? 0
    const min = settingStore.preferences.schedule_to_min ?? 0
    const date = new Date()
    date.setHours(hour, min, 0, 0)
    return date.getTime()
  },
  set: (val: number) => {
    const date = new Date(val)
    settingStore.preferences.schedule_to_hour = date.getHours()
    settingStore.preferences.schedule_to_min = date.getMinutes()
  }
})

const schedulerDaysOptions = computed(() => [
  { label: $t('settings.speed.scheduler.daysEveryDay'), value: 0 },
  { label: $t('settings.speed.scheduler.daysWeekdays'), value: 1 },
  { label: $t('settings.speed.scheduler.daysWeekends'), value: 2 },
  { label: $t('settings.speed.scheduler.daysMonday'), value: 3 },
  { label: $t('settings.speed.scheduler.daysTuesday'), value: 4 },
  { label: $t('settings.speed.scheduler.daysWednesday'), value: 5 },
  { label: $t('settings.speed.scheduler.daysThursday'), value: 6 },
  { label: $t('settings.speed.scheduler.daysFriday'), value: 7 },
  { label: $t('settings.speed.scheduler.daysSaturday'), value: 8 },
  { label: $t('settings.speed.scheduler.daysSunday'), value: 9 }
])

// 初始化默认值
onMounted(() => {
  if (settingStore.preferences.up_limit === undefined) {
    settingStore.preferences.up_limit = 0
  }
  if (settingStore.preferences.dl_limit === undefined) {
    settingStore.preferences.dl_limit = 0
  }
  if (settingStore.preferences.alt_up_limit === undefined) {
    settingStore.preferences.alt_up_limit = 10240
  }
  if (settingStore.preferences.alt_dl_limit === undefined) {
    settingStore.preferences.alt_dl_limit = 10240
  }
  if (settingStore.preferences.scheduler_enabled === undefined) {
    settingStore.preferences.scheduler_enabled = false
  }
  if (settingStore.preferences.schedule_from_hour === undefined) {
    settingStore.preferences.schedule_from_hour = 8
  }
  if (settingStore.preferences.schedule_from_min === undefined) {
    settingStore.preferences.schedule_from_min = 0
  }
  if (settingStore.preferences.schedule_to_hour === undefined) {
    settingStore.preferences.schedule_to_hour = 20
  }
  if (settingStore.preferences.schedule_to_min === undefined) {
    settingStore.preferences.schedule_to_min = 0
  }
  if (settingStore.preferences.scheduler_days === undefined) {
    settingStore.preferences.scheduler_days = 0
  }
  if (settingStore.preferences.limit_utp_rate === undefined) {
    settingStore.preferences.limit_utp_rate = true
  }
  if (settingStore.preferences.limit_tcp_overhead === undefined) {
    settingStore.preferences.limit_tcp_overhead = false
  }
  if (settingStore.preferences.limit_lan_peers === undefined) {
    settingStore.preferences.limit_lan_peers = true
  }
})
</script>

