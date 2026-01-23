<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="320">
      <n-divider title-placement="left">
        {{ $t('settings.advanced.qbittorrent.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.advanced.qbittorrent.resumeDataStorageType')">
        <n-select
          v-model:value="settingStore.preferences.resume_data_storage_type"
          :options="resumeDataStorageOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.torrentContentRemoveOption')">
        <n-select
          v-model:value="settingStore.preferences.torrent_content_remove_option"
          :options="torrentContentRemoveOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.memoryWorkingSetLimit')">
        <n-input-number v-model:value="settingStore.preferences.memory_working_set_limit" :min="0" style="width: 160px">
          <template #suffix>MiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.networkInterface')">
        <n-select
          v-model:value="settingStore.preferences.current_network_interface"
          :options="networkInterfaceOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.optionalIPAddress')">
        <n-select
          v-model:value="settingStore.preferences.current_interface_address"
          :options="interfaceAddressOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.saveResumeDataInterval')">
        <n-input-number
          v-model:value="settingStore.preferences.save_resume_data_interval"
          :min="1"
          style="width: 160px"
        >
          <template #suffix>{{ $t('common.minutes') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.saveStatisticsInterval')">
        <n-input-number v-model:value="settingStore.preferences.save_statistics_interval" :min="1" style="width: 160px">
          <template #suffix>{{ $t('common.minutes') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.torrentFileSizeLimit')">
        <n-input-number v-model:value="torrentFileSizeLimitMiB" :min="1" style="width: 160px">
          <template #suffix>MiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.confirmTorrentRecheck')">
        <n-checkbox v-model:checked="settingStore.preferences.confirm_torrent_recheck" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.recheckOnCompletion')">
        <n-checkbox v-model:checked="settingStore.preferences.recheck_completed_torrents" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.appInstanceName')">
        <n-input
          v-model:value="settingStore.preferences.app_instance_name"
          :placeholder="$t('settings.advanced.qbittorrent.appInstanceNamePlaceholder')"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.refreshInterval')">
        <n-input-number v-model:value="settingStore.preferences.refresh_interval" :min="100" style="width: 160px">
          <template #suffix>ms</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.resolvePeerCountries')">
        <n-checkbox v-model:checked="settingStore.preferences.resolve_peer_countries" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.reannounceWhenAddressChanged')">
        <n-checkbox v-model:checked="settingStore.preferences.reannounce_when_address_changed" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.enableEmbeddedTracker')">
        <n-checkbox v-model:checked="settingStore.preferences.enable_embedded_tracker" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.embeddedTrackerPort')">
        <n-input-number
          v-model:value="settingStore.preferences.embedded_tracker_port"
          :min="1"
          :max="65535"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.embeddedTrackerPortForwarding')">
        <n-checkbox v-model:checked="settingStore.preferences.embedded_tracker_port_forwarding" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.markOfTheWeb')">
        <n-checkbox v-model:checked="settingStore.preferences.mark_of_the_web" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.ignoreSSLErrors')">
        <n-checkbox v-model:checked="settingStore.preferences.ignore_ssl_errors" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.qbittorrent.pythonExecutablePath')">
        <n-input
          v-model:value="settingStore.preferences.python_executable_path"
          :placeholder="$t('settings.advanced.qbittorrent.pythonExecutablePathPlaceholder')"
          style="width: 100%"
        />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.advanced.libtorrent.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.advanced.libtorrent.bdecodeDepthLimit')">
        <n-input-number v-model:value="settingStore.preferences.bdecode_depth_limit" :min="1" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.bdecodeTokenLimit')">
        <n-input-number v-model:value="settingStore.preferences.bdecode_token_limit" :min="1" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.asyncIOThreads')">
        <n-input-number
          v-model:value="settingStore.preferences.async_io_threads"
          :min="1"
          :max="1024"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.hashingThreads')">
        <n-input-number
          v-model:value="settingStore.preferences.hashing_threads"
          :min="1"
          :max="1024"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.filePoolSize')">
        <n-input-number v-model:value="settingStore.preferences.file_pool_size" :min="1" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.checkingMemoryUse')">
        <n-input-number v-model:value="settingStore.preferences.checking_memory_use" :min="1" style="width: 160px">
          <template #suffix>MiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskCache')">
        <n-input-number v-model:value="settingStore.preferences.disk_cache" :min="-1" style="width: 160px">
          <template #suffix>MiB</template>
        </n-input-number>
        <span style="margin-left: 8px; color: var(--n-text-color-disabled)">
          {{ $t('settings.advanced.libtorrent.diskCacheHint') }}
        </span>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskCacheTTL')">
        <n-input-number v-model:value="settingStore.preferences.disk_cache_ttl" :min="1" style="width: 160px">
          <template #suffix>{{ $t('settings.advanced.libtorrent.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskQueueSize')">
        <n-input-number v-model:value="diskQueueSizeKiB" :min="1" style="width: 160px">
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskIOType')">
        <n-select
          v-model:value="settingStore.preferences.disk_io_type"
          :options="diskIOTypeOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskIOReadMode')">
        <n-select
          v-model:value="settingStore.preferences.disk_io_read_mode"
          :options="diskIOModeOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.diskIOWriteMode')">
        <n-select
          v-model:value="settingStore.preferences.disk_io_write_mode"
          :options="diskIOWriteModeOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.coalesceReadsWrites')">
        <n-checkbox v-model:checked="settingStore.preferences.enable_coalesce_read_write" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.sendUploadPieceSuggestions')">
        <n-checkbox v-model:checked="settingStore.preferences.enable_upload_suggestions" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.sendBufferWatermark')">
        <n-input-number v-model:value="settingStore.preferences.send_buffer_watermark" :min="1" style="width: 160px">
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.sendBufferLowWatermark')">
        <n-input-number
          v-model:value="settingStore.preferences.send_buffer_low_watermark"
          :min="1"
          style="width: 160px"
        >
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.sendBufferWatermarkFactor')">
        <n-input-number
          v-model:value="settingStore.preferences.send_buffer_watermark_factor"
          :min="1"
          :max="1000"
          style="width: 160px"
        >
          <template #suffix>%</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.connectionSpeed')">
        <n-input-number v-model:value="settingStore.preferences.connection_speed" :min="0" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.socketSendBufferSize')">
        <n-input-number v-model:value="socketSendBufferSizeKiB" :min="0" style="width: 160px">
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.socketReceiveBufferSize')">
        <n-input-number v-model:value="socketReceiveBufferSizeKiB" :min="0" style="width: 160px">
          <template #suffix>KiB</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.socketBacklogSize')">
        <n-input-number v-model:value="settingStore.preferences.socket_backlog_size" :min="1" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.outgoingPortsMin')">
        <n-input-number
          v-model:value="settingStore.preferences.outgoing_ports_min"
          :min="0"
          :max="65535"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.outgoingPortsMax')">
        <n-input-number
          v-model:value="settingStore.preferences.outgoing_ports_max"
          :min="0"
          :max="65535"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.upnpLeaseDuration')">
        <n-input-number v-model:value="settingStore.preferences.upnp_lease_duration" :min="0" style="width: 160px">
          <template #suffix>{{ $t('settings.advanced.libtorrent.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.peerToS')">
        <n-input-number v-model:value="settingStore.preferences.peer_tos" :min="0" :max="255" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.utpTcpMixedMode')">
        <n-select
          v-model:value="settingStore.preferences.utp_tcp_mixed_mode"
          :options="utpTcpMixedModeOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.idnSupport')">
        <n-checkbox v-model:checked="settingStore.preferences.idn_support_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.allowMultipleConnectionsFromSameIP')">
        <n-checkbox v-model:checked="settingStore.preferences.enable_multi_connections_from_same_ip" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.validateHTTPSTrackerCertificate')">
        <n-checkbox v-model:checked="settingStore.preferences.validate_https_tracker_certificate" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.ssrfMitigation')">
        <n-checkbox v-model:checked="settingStore.preferences.ssrf_mitigation" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.blockPeersOnPrivilegedPorts')">
        <n-checkbox v-model:checked="settingStore.preferences.block_peers_on_privileged_ports" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.uploadSlotsBehavior')">
        <n-select
          v-model:value="settingStore.preferences.upload_slots_behavior"
          :options="uploadSlotsBehaviorOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.libtorrent.uploadChokingAlgorithm')">
        <n-select
          v-model:value="settingStore.preferences.upload_choking_algorithm"
          :options="uploadChokingAlgorithmOptions"
          style="width: 240px"
        />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.advanced.tracker.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.advanced.tracker.announceToAllTrackers')">
        <n-checkbox v-model:checked="settingStore.preferences.announce_to_all_trackers" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.announceToAllTiers')">
        <n-checkbox v-model:checked="settingStore.preferences.announce_to_all_tiers" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.announceIP')">
        <n-input
          v-model:value="settingStore.preferences.announce_ip"
          :placeholder="$t('settings.advanced.tracker.announceIPPlaceholder')"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.announcePort')">
        <n-input-number
          v-model:value="settingStore.preferences.announce_port"
          :min="0"
          :max="65535"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.maxConcurrentHTTPAnnounces')">
        <n-input-number
          v-model:value="settingStore.preferences.max_concurrent_http_announces"
          :min="1"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.peerTurnover')">
        <n-input-number v-model:value="settingStore.preferences.peer_turnover" :min="0" :max="100" style="width: 160px">
          <template #suffix>%</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.peerTurnoverCutoff')">
        <n-input-number
          v-model:value="settingStore.preferences.peer_turnover_cutoff"
          :min="0"
          :max="100"
          style="width: 160px"
        >
          <template #suffix>%</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.peerTurnoverInterval')">
        <n-input-number v-model:value="settingStore.preferences.peer_turnover_interval" :min="0" style="width: 160px">
          <template #suffix>{{ $t('settings.advanced.libtorrent.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.requestQueueSize')">
        <n-input-number v-model:value="settingStore.preferences.request_queue_size" :min="1" style="width: 160px" />
      </n-form-item>

      <n-form-item :label="$t('settings.advanced.tracker.dhtBootstrapNodes')">
        <n-input
          v-model:value="settingStore.preferences.dht_bootstrap_nodes"
          :placeholder="$t('settings.advanced.tracker.dhtBootstrapNodesPlaceholder')"
          style="width: 100%"
        />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useI18n } from 'vue-i18n'
import { getNetworkInterfaceList, getNetworkInterfaceAddressList } from '@/api/modules/application'

const { t: $t } = useI18n()
const settingStore = useSettingStore()
const isMobile = useIsSmallScreen()

const labelPlacement = computed(() => (isMobile.value ? 'top' : 'left'))

// 网络接口列表
const networkInterfaces = ref<Array<{ name: string; value: string }>>([])
// IP 地址列表（字符串数组）
const interfaceAddresses = ref<string[]>([])

// 加载网络接口列表
const loadNetworkInterfaces = async () => {
  try {
    networkInterfaces.value = await getNetworkInterfaceList()
  } catch (error) {
    console.error('Failed to load network interfaces:', error)
    networkInterfaces.value = []
  }
}

// 加载网络接口的 IP 地址列表
const loadInterfaceAddresses = async (iface: string = '') => {
  try {
    const addresses = await getNetworkInterfaceAddressList(iface)
    interfaceAddresses.value = addresses
  } catch (error) {
    console.error('Failed to load interface addresses:', error)
    interfaceAddresses.value = []
  }
}

// 监听网络接口变化，重新加载 IP 地址列表
watch(
  () => settingStore.preferences.current_network_interface,
  async (newInterface) => {
    await loadInterfaceAddresses(newInterface || '')
  }
)

// 选项配置
const resumeDataStorageOptions = computed(() => [
  { label: $t('settings.advanced.qbittorrent.resumeDataStorageTypeLegacy'), value: 'Legacy' },
  { label: $t('settings.advanced.qbittorrent.resumeDataStorageTypeSQLite'), value: 'SQLite' }
])

const torrentContentRemoveOptions = computed(() => [
  { label: $t('settings.advanced.qbittorrent.torrentContentRemoveDelete'), value: 'Delete' },
  { label: $t('settings.advanced.qbittorrent.torrentContentRemoveMoveToTrash'), value: 'MoveToTrash' }
])

const networkInterfaceOptions = computed(() => {
  const options = [{ label: $t('settings.advanced.qbittorrent.networkInterfaceAny'), value: '' }]
  // 添加从 API 获取的网络接口列表
  if (networkInterfaces.value.length > 0) {
    options.push(...networkInterfaces.value.map((iface) => ({ label: iface.name, value: iface.value })))
  }
  return options
})

const interfaceAddressOptions = computed(() => {
  // 三个默认选项
  const options = [
    { label: $t('settings.advanced.qbittorrent.allAddresses'), value: '' },
    { label: $t('settings.advanced.qbittorrent.allIPv4Addresses'), value: '0.0.0.0' },
    { label: $t('settings.advanced.qbittorrent.allIPv6Addresses'), value: '::' }
  ]
  // 添加从 API 获取的 IP 地址列表（将字符串转换为选项格式）
  if (interfaceAddresses.value.length > 0) {
    options.push(...interfaceAddresses.value.map((addr) => ({ label: addr, value: addr })))
  }
  return options
})

const diskIOTypeOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.diskIOTypeDefault'), value: 0 },
  { label: $t('settings.advanced.libtorrent.diskIOTypeMemoryMapped'), value: 1 },
  { label: $t('settings.advanced.libtorrent.diskIOTypePOSIX'), value: 2 }
])

const diskIOModeOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.diskIOModeDisableOSCache'), value: 0 },
  { label: $t('settings.advanced.libtorrent.diskIOModeEnableOSCache'), value: 1 }
])

const diskIOWriteModeOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.diskIOModeDisableOSCache'), value: 0 },
  { label: $t('settings.advanced.libtorrent.diskIOModeEnableOSCache'), value: 1 },
  { label: $t('settings.advanced.libtorrent.diskIOWriteModeWriteThrough'), value: 2 }
])

const utpTcpMixedModeOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.utpTcpMixedModePreferTCP'), value: 0 },
  { label: $t('settings.advanced.libtorrent.utpTcpMixedModePeerProportional'), value: 1 }
])

const uploadSlotsBehaviorOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.uploadSlotsBehaviorFixedSlots'), value: 0 },
  { label: $t('settings.advanced.libtorrent.uploadSlotsBehaviorUploadRate'), value: 1 }
])

const uploadChokingAlgorithmOptions = computed(() => [
  { label: $t('settings.advanced.libtorrent.uploadChokingAlgorithmRoundRobin'), value: 0 },
  { label: $t('settings.advanced.libtorrent.uploadChokingAlgorithmFastestUpload'), value: 1 },
  { label: $t('settings.advanced.libtorrent.uploadChokingAlgorithmAntiLeech'), value: 2 }
])

// 单位转换的计算属性
const torrentFileSizeLimitMiB = computed({
  get: () => Math.round((settingStore.preferences.torrent_file_size_limit || 0) / 1024 / 1024),
  set: (val: number) => {
    settingStore.preferences.torrent_file_size_limit = val * 1024 * 1024
  }
})

const diskQueueSizeKiB = computed({
  get: () => Math.round((settingStore.preferences.disk_queue_size || 0) / 1024),
  set: (val: number) => {
    settingStore.preferences.disk_queue_size = val * 1024
  }
})

const socketSendBufferSizeKiB = computed({
  get: () => Math.round((settingStore.preferences.socket_send_buffer_size || 0) / 1024),
  set: (val: number) => {
    settingStore.preferences.socket_send_buffer_size = val * 1024
  }
})

const socketReceiveBufferSizeKiB = computed({
  get: () => Math.round((settingStore.preferences.socket_receive_buffer_size || 0) / 1024),
  set: (val: number) => {
    settingStore.preferences.socket_receive_buffer_size = val * 1024
  }
})

// 初始化默认值
onMounted(async () => {
  // 加载网络接口列表
  await loadNetworkInterfaces()
  // 加载 IP 地址列表（根据当前选择的网络接口）
  await loadInterfaceAddresses(settingStore.preferences.current_network_interface || '')

  // qBittorrent 相关
  if (!settingStore.preferences.resume_data_storage_type) {
    settingStore.preferences.resume_data_storage_type = 'Legacy'
  }
  if (!settingStore.preferences.torrent_content_remove_option) {
    settingStore.preferences.torrent_content_remove_option = 'Delete'
  }
  if (settingStore.preferences.memory_working_set_limit === undefined) {
    settingStore.preferences.memory_working_set_limit = 512
  }
  if (!settingStore.preferences.current_network_interface) {
    settingStore.preferences.current_network_interface = ''
  }
  if (!settingStore.preferences.current_interface_address) {
    settingStore.preferences.current_interface_address = ''
  }
  if (settingStore.preferences.save_resume_data_interval === undefined) {
    settingStore.preferences.save_resume_data_interval = 60
  }
  if (settingStore.preferences.save_statistics_interval === undefined) {
    settingStore.preferences.save_statistics_interval = 15
  }
  if (settingStore.preferences.torrent_file_size_limit === undefined) {
    settingStore.preferences.torrent_file_size_limit = 100 * 1024 * 1024
  }
  if (settingStore.preferences.confirm_torrent_recheck === undefined) {
    settingStore.preferences.confirm_torrent_recheck = true
  }
  if (settingStore.preferences.recheck_completed_torrents === undefined) {
    settingStore.preferences.recheck_completed_torrents = false
  }
  if (!settingStore.preferences.app_instance_name) {
    settingStore.preferences.app_instance_name = ''
  }
  if (settingStore.preferences.refresh_interval === undefined) {
    settingStore.preferences.refresh_interval = 1500
  }
  if (settingStore.preferences.resolve_peer_countries === undefined) {
    settingStore.preferences.resolve_peer_countries = true
  }
  if (settingStore.preferences.reannounce_when_address_changed === undefined) {
    settingStore.preferences.reannounce_when_address_changed = false
  }
  if (settingStore.preferences.enable_embedded_tracker === undefined) {
    settingStore.preferences.enable_embedded_tracker = false
  }
  if (settingStore.preferences.embedded_tracker_port === undefined) {
    settingStore.preferences.embedded_tracker_port = 9000
  }
  if (settingStore.preferences.embedded_tracker_port_forwarding === undefined) {
    settingStore.preferences.embedded_tracker_port_forwarding = false
  }
  if (settingStore.preferences.mark_of_the_web === undefined) {
    settingStore.preferences.mark_of_the_web = false
  }
  if (settingStore.preferences.ignore_ssl_errors === undefined) {
    settingStore.preferences.ignore_ssl_errors = false
  }
  if (!settingStore.preferences.python_executable_path) {
    settingStore.preferences.python_executable_path = ''
  }

  // libtorrent 相关
  if (settingStore.preferences.bdecode_depth_limit === undefined) {
    settingStore.preferences.bdecode_depth_limit = 100
  }
  if (settingStore.preferences.bdecode_token_limit === undefined) {
    settingStore.preferences.bdecode_token_limit = 3000000
  }
  if (settingStore.preferences.async_io_threads === undefined) {
    settingStore.preferences.async_io_threads = 10
  }
  if (settingStore.preferences.hashing_threads === undefined) {
    settingStore.preferences.hashing_threads = 2
  }
  if (settingStore.preferences.file_pool_size === undefined) {
    settingStore.preferences.file_pool_size = 5000
  }
  if (settingStore.preferences.checking_memory_use === undefined) {
    settingStore.preferences.checking_memory_use = 32
  }
  if (settingStore.preferences.disk_cache === undefined) {
    settingStore.preferences.disk_cache = -1
  }
  if (settingStore.preferences.disk_cache_ttl === undefined) {
    settingStore.preferences.disk_cache_ttl = 60
  }
  if (settingStore.preferences.disk_queue_size === undefined) {
    settingStore.preferences.disk_queue_size = 16384 * 1024
  }
  if (settingStore.preferences.disk_io_type === undefined) {
    settingStore.preferences.disk_io_type = 0
  }
  if (settingStore.preferences.disk_io_read_mode === undefined) {
    settingStore.preferences.disk_io_read_mode = 0
  }
  if (settingStore.preferences.disk_io_write_mode === undefined) {
    settingStore.preferences.disk_io_write_mode = 0
  }
  if (settingStore.preferences.enable_coalesce_read_write === undefined) {
    settingStore.preferences.enable_coalesce_read_write = true
  }
  if (settingStore.preferences.enable_upload_suggestions === undefined) {
    settingStore.preferences.enable_upload_suggestions = false
  }
  if (settingStore.preferences.send_buffer_watermark === undefined) {
    settingStore.preferences.send_buffer_watermark = 500
  }
  if (settingStore.preferences.send_buffer_low_watermark === undefined) {
    settingStore.preferences.send_buffer_low_watermark = 10
  }
  if (settingStore.preferences.send_buffer_watermark_factor === undefined) {
    settingStore.preferences.send_buffer_watermark_factor = 50
  }
  if (settingStore.preferences.connection_speed === undefined) {
    settingStore.preferences.connection_speed = 30
  }
  if (settingStore.preferences.socket_send_buffer_size === undefined) {
    settingStore.preferences.socket_send_buffer_size = 0
  }
  if (settingStore.preferences.socket_receive_buffer_size === undefined) {
    settingStore.preferences.socket_receive_buffer_size = 0
  }
  if (settingStore.preferences.socket_backlog_size === undefined) {
    settingStore.preferences.socket_backlog_size = 30
  }
  if (settingStore.preferences.outgoing_ports_min === undefined) {
    settingStore.preferences.outgoing_ports_min = 0
  }
  if (settingStore.preferences.outgoing_ports_max === undefined) {
    settingStore.preferences.outgoing_ports_max = 0
  }
  if (settingStore.preferences.upnp_lease_duration === undefined) {
    settingStore.preferences.upnp_lease_duration = 0
  }
  if (settingStore.preferences.peer_tos === undefined) {
    settingStore.preferences.peer_tos = 0
  }
  if (settingStore.preferences.utp_tcp_mixed_mode === undefined) {
    settingStore.preferences.utp_tcp_mixed_mode = 0
  }
  if (settingStore.preferences.idn_support_enabled === undefined) {
    settingStore.preferences.idn_support_enabled = false
  }
  if (settingStore.preferences.enable_multi_connections_from_same_ip === undefined) {
    settingStore.preferences.enable_multi_connections_from_same_ip = false
  }
  if (settingStore.preferences.validate_https_tracker_certificate === undefined) {
    settingStore.preferences.validate_https_tracker_certificate = true
  }
  if (settingStore.preferences.ssrf_mitigation === undefined) {
    settingStore.preferences.ssrf_mitigation = true
  }
  if (settingStore.preferences.block_peers_on_privileged_ports === undefined) {
    settingStore.preferences.block_peers_on_privileged_ports = false
  }
  if (settingStore.preferences.upload_slots_behavior === undefined) {
    settingStore.preferences.upload_slots_behavior = 0
  }
  if (settingStore.preferences.upload_choking_algorithm === undefined) {
    settingStore.preferences.upload_choking_algorithm = 1
  }

  // Tracker 相关
  if (settingStore.preferences.announce_to_all_trackers === undefined) {
    settingStore.preferences.announce_to_all_trackers = false
  }
  if (settingStore.preferences.announce_to_all_tiers === undefined) {
    settingStore.preferences.announce_to_all_tiers = true
  }
  if (!settingStore.preferences.announce_ip) {
    settingStore.preferences.announce_ip = ''
  }
  if (settingStore.preferences.announce_port === undefined) {
    settingStore.preferences.announce_port = 0
  }
  if (settingStore.preferences.max_concurrent_http_announces === undefined) {
    settingStore.preferences.max_concurrent_http_announces = 50
  }
  if (settingStore.preferences.peer_turnover === undefined) {
    settingStore.preferences.peer_turnover = 4
  }
  if (settingStore.preferences.peer_turnover_cutoff === undefined) {
    settingStore.preferences.peer_turnover_cutoff = 90
  }
  if (settingStore.preferences.peer_turnover_interval === undefined) {
    settingStore.preferences.peer_turnover_interval = 300
  }
  if (settingStore.preferences.request_queue_size === undefined) {
    settingStore.preferences.request_queue_size = 500
  }
  if (!settingStore.preferences.dht_bootstrap_nodes) {
    settingStore.preferences.dht_bootstrap_nodes = ''
  }
})
</script>
