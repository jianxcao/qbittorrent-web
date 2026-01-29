<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="220">
      <n-divider title-placement="left">
        {{ $t('settings.bittorrent.privacy.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.bittorrent.privacy.enableDHT')">
        <n-checkbox v-model:checked="settingStore.preferences.dht" />
      </n-form-item>

      <n-form-item :label="$t('settings.bittorrent.privacy.enablePeX')">
        <n-checkbox v-model:checked="settingStore.preferences.pex" />
      </n-form-item>

      <n-form-item :label="$t('settings.bittorrent.privacy.enableLSD')">
        <n-checkbox v-model:checked="settingStore.preferences.lsd" />
      </n-form-item>

      <n-form-item :label="$t('settings.bittorrent.privacy.encryption')">
        <n-select v-model:value="settingStore.preferences.encryption" :options="encryptionOptions" />
      </n-form-item>

      <n-form-item :label="$t('settings.bittorrent.privacy.anonymousMode')">
        <n-checkbox v-model:checked="settingStore.preferences.anonymous_mode" />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.bittorrent.queueing.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.bittorrent.queueing.enableQueueing')">
        <n-checkbox v-model:checked="settingStore.preferences.queueing_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.queueing_enabled">
        <n-form-item :label="$t('settings.bittorrent.queueing.maxActiveDownloads')">
          <n-input-number v-model:value="settingStore.preferences.max_active_downloads" :min="1" style="width: 160px" />
        </n-form-item>

        <n-form-item :label="$t('settings.bittorrent.queueing.maxActiveUploads')">
          <n-input-number v-model:value="settingStore.preferences.max_active_uploads" :min="1" style="width: 160px" />
        </n-form-item>

        <n-form-item :label="$t('settings.bittorrent.queueing.maxActiveTorrents')">
          <n-input-number v-model:value="settingStore.preferences.max_active_torrents" :min="1" style="width: 160px" />
        </n-form-item>

        <n-form-item :label="$t('settings.bittorrent.queueing.ignoreSlowTorrents')">
          <n-checkbox v-model:checked="settingStore.preferences.dont_count_slow_torrents" />
        </n-form-item>

        <template v-if="settingStore.preferences.dont_count_slow_torrents">
          <n-form-item :label="$t('settings.bittorrent.queueing.downloadRateThreshold')">
            <n-input-number
              v-model:value="settingStore.preferences.slow_torrent_dl_rate_threshold"
              :min="0"
              style="width: 160px"
            >
              <template #suffix>KiB/s</template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="$t('settings.bittorrent.queueing.uploadRateThreshold')">
            <n-input-number
              v-model:value="settingStore.preferences.slow_torrent_ul_rate_threshold"
              :min="0"
              style="width: 160px"
            >
              <template #suffix>KiB/s</template>
            </n-input-number>
          </n-form-item>

          <n-form-item :label="$t('settings.bittorrent.queueing.inactiveTimer')">
            <n-input-number
              v-model:value="settingStore.preferences.slow_torrent_inactive_timer"
              :min="0"
              style="width: 160px"
            >
              <template #suffix>{{ $t('common.minutes') }}</template>
            </n-input-number>
          </n-form-item>
        </template>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.bittorrent.seeding.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.bittorrent.seeding.maxActiveCheckingTorrents')">
        <n-input-number
          v-model:value="settingStore.preferences.max_active_checking_torrents"
          :min="1"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.bittorrent.seeding.maxRatioEnabled')">
        <n-checkbox v-model:checked="settingStore.preferences.max_ratio_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.max_ratio_enabled">
        <n-form-item :label="$t('settings.bittorrent.seeding.maxRatio')">
          <n-input-number
            v-model:value="settingStore.preferences.max_ratio"
            :min="-1"
            :step="0.1"
            style="width: 160px"
          />
        </n-form-item>
      </template>

      <n-form-item :label="$t('settings.bittorrent.seeding.maxSeedingTimeEnabled')">
        <n-checkbox v-model:checked="settingStore.preferences.max_seeding_time_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.max_seeding_time_enabled">
        <n-form-item :label="$t('settings.bittorrent.seeding.maxSeedingTime')">
          <n-input-number v-model:value="settingStore.preferences.max_seeding_time" :min="-1" style="width: 160px">
            <template #suffix>{{ $t('common.minutes') }}</template>
          </n-input-number>
        </n-form-item>
      </template>

      <n-form-item :label="$t('settings.bittorrent.seeding.maxInactiveSeedingTimeEnabled')">
        <n-checkbox v-model:checked="settingStore.preferences.max_inactive_seeding_time_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.max_inactive_seeding_time_enabled">
        <n-form-item :label="$t('settings.bittorrent.seeding.maxInactiveSeedingTime')">
          <n-input-number
            v-model:value="settingStore.preferences.max_inactive_seeding_time"
            :min="-1"
            style="width: 160px"
          >
            <template #suffix>{{ $t('common.minutes') }}</template>
          </n-input-number>
        </n-form-item>
      </template>

      <template
        v-if="
          settingStore.preferences.max_ratio_enabled ||
          settingStore.preferences.max_seeding_time_enabled ||
          settingStore.preferences.max_inactive_seeding_time_enabled
        "
      >
        <n-form-item :label="$t('settings.bittorrent.seeding.thenAction')">
          <n-select v-model:value="settingStore.preferences.max_ratio_act" :options="seedingActionOptions" />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.bittorrent.trackers.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.bittorrent.trackers.autoAddTrackers')">
        <n-checkbox v-model:checked="settingStore.preferences.add_trackers_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.add_trackers_enabled">
        <n-form-item :label="$t('settings.bittorrent.trackers.trackersList')">
          <n-input
            v-model:value="settingStore.preferences.add_trackers"
            type="textarea"
            :placeholder="$t('settings.bittorrent.trackers.trackersPlaceholder')"
            :rows="5"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-form-item :label="$t('settings.bittorrent.trackers.ignoredPrefixes')">
        <div style="width: 100%">
          <n-dynamic-tags
            v-model:value="ignoredTrackerPrefixes"
            @update:value="handleIgnoredPrefixesChange"
          />
          <n-text depth="3" style="font-size: 12px; margin-top: 4px; display: block">
            {{ $t('settings.bittorrent.trackers.ignoredPrefixesHint') }}
          </n-text>
        </div>
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

// 管理忽略的 Tracker 前缀
const ignoredTrackerPrefixes = ref<string[]>([])

// 初始化时从 store 加载数据
watchEffect(() => {
  ignoredTrackerPrefixes.value = [...settingStore.setting.ignoredTrackerPrefixes]
})

// 更新 store 中的数据
const handleIgnoredPrefixesChange = (value: string[]) => {
  settingStore.changeIgnoredTrackerPrefixes(value)
}

const encryptionOptions = computed(() => [
  { label: $t('settings.bittorrent.privacy.encryptionPrefer'), value: 0 },
  { label: $t('settings.bittorrent.privacy.encryptionForceOn'), value: 1 },
  { label: $t('settings.bittorrent.privacy.encryptionForceOff'), value: 2 }
])

const seedingActionOptions = computed(() => [
  { label: $t('settings.bittorrent.seeding.actionPause'), value: 0 },
  { label: $t('settings.bittorrent.seeding.actionRemove'), value: 1 },
  { label: $t('settings.bittorrent.seeding.actionRemoveWithFiles'), value: 2 },
  { label: $t('settings.bittorrent.seeding.actionSuperSeeding'), value: 3 }
])

// 初始化默认值
onMounted(() => {
  if (settingStore.preferences.dht === undefined) {
    settingStore.preferences.dht = true
  }
  if (settingStore.preferences.pex === undefined) {
    settingStore.preferences.pex = true
  }
  if (settingStore.preferences.lsd === undefined) {
    settingStore.preferences.lsd = true
  }
  if (settingStore.preferences.encryption === undefined) {
    settingStore.preferences.encryption = 0
  }
  if (settingStore.preferences.anonymous_mode === undefined) {
    settingStore.preferences.anonymous_mode = false
  }
  if (settingStore.preferences.queueing_enabled === undefined) {
    settingStore.preferences.queueing_enabled = true
  }
  if (settingStore.preferences.max_active_downloads === undefined) {
    settingStore.preferences.max_active_downloads = 3
  }
  if (settingStore.preferences.max_active_uploads === undefined) {
    settingStore.preferences.max_active_uploads = 3
  }
  if (settingStore.preferences.max_active_torrents === undefined) {
    settingStore.preferences.max_active_torrents = 5
  }
  if (settingStore.preferences.dont_count_slow_torrents === undefined) {
    settingStore.preferences.dont_count_slow_torrents = false
  }
  if (settingStore.preferences.slow_torrent_dl_rate_threshold === undefined) {
    settingStore.preferences.slow_torrent_dl_rate_threshold = 2
  }
  if (settingStore.preferences.slow_torrent_ul_rate_threshold === undefined) {
    settingStore.preferences.slow_torrent_ul_rate_threshold = 2
  }
  if (settingStore.preferences.slow_torrent_inactive_timer === undefined) {
    settingStore.preferences.slow_torrent_inactive_timer = 60
  }
  if (settingStore.preferences.max_active_checking_torrents === undefined) {
    settingStore.preferences.max_active_checking_torrents = 1
  }
  if (settingStore.preferences.max_ratio_enabled === undefined) {
    settingStore.preferences.max_ratio_enabled = false
  }
  if (settingStore.preferences.max_ratio === undefined) {
    settingStore.preferences.max_ratio = -1
  }
  if (settingStore.preferences.max_ratio_act === undefined) {
    settingStore.preferences.max_ratio_act = 0
  }
  if (settingStore.preferences.max_seeding_time_enabled === undefined) {
    settingStore.preferences.max_seeding_time_enabled = false
  }
  if (settingStore.preferences.max_seeding_time === undefined) {
    settingStore.preferences.max_seeding_time = -1
  }
  if (settingStore.preferences.max_inactive_seeding_time_enabled === undefined) {
    settingStore.preferences.max_inactive_seeding_time_enabled = false
  }
  if (settingStore.preferences.max_inactive_seeding_time === undefined) {
    settingStore.preferences.max_inactive_seeding_time = -1
  }
  if (settingStore.preferences.add_trackers_enabled === undefined) {
    settingStore.preferences.add_trackers_enabled = false
  }
  if (settingStore.preferences.add_trackers === undefined) {
    settingStore.preferences.add_trackers = ''
  }
})
</script>
