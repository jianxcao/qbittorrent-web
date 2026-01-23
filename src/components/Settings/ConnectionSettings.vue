<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="240">
      <n-divider title-placement="left">
        {{ $t('settings.connection.protocol.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.connection.protocol.bittorrentProtocol')">
        <n-select
          v-model:value="settingStore.preferences.bittorrent_protocol"
          :options="protocolOptions"
          class="w-50"
        />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.connection.listeningPort.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.connection.listeningPort.port')">
        <n-input-number v-model:value="settingStore.preferences.listen_port" :min="0" :max="65535" class="w-40" />
        <n-button @click="generateRandomPort" class="ml-2">
          {{ $t('settings.connection.listeningPort.randomPort') }}
        </n-button>
      </n-form-item>

      <n-form-item :label="$t('settings.connection.listeningPort.useUPnP')">
        <n-checkbox v-model:checked="settingStore.preferences.upnp" />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.connection.connectionLimits.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.connection.connectionLimits.globalMaxConnections')">
        <n-checkbox v-model:checked="maxConnecEnabled" class="mr-2" />
        <n-input-number
          v-model:value="settingStore.preferences.max_connec"
          :disabled="!maxConnecEnabled"
          :min="1"
          class="w-40"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.connectionLimits.maxConnectionsPerTorrent')">
        <n-checkbox v-model:checked="maxConnecPerTorrentEnabled" class="mr-2" />
        <n-input-number
          v-model:value="settingStore.preferences.max_connec_per_torrent"
          :disabled="!maxConnecPerTorrentEnabled"
          :min="1"
          class="w-40"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.connectionLimits.globalMaxUploads')">
        <n-checkbox v-model:checked="maxUploadsEnabled" class="mr-2" />
        <n-input-number
          v-model:value="settingStore.preferences.max_uploads"
          :disabled="!maxUploadsEnabled"
          :min="1"
          class="w-40"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.connectionLimits.maxUploadsPerTorrent')">
        <n-checkbox v-model:checked="maxUploadsPerTorrentEnabled" class="mr-2" />
        <n-input-number
          v-model:value="settingStore.preferences.max_uploads_per_torrent"
          :disabled="!maxUploadsPerTorrentEnabled"
          :min="1"
          class="w-40"
        />
      </n-form-item>

      <n-divider title-placement="left">
        <n-checkbox v-model:checked="settingStore.preferences.i2p_enabled" class="mr-2" />
        {{ $t('settings.connection.i2p.title') }}
      </n-divider>

      <template v-if="settingStore.preferences.i2p_enabled">
        <n-form-item :label="$t('settings.connection.i2p.host')">
          <n-input v-model:value="settingStore.preferences.i2p_address" class="w-50" />
          <span class="mx-4">{{ $t('settings.connection.i2p.port') }}</span>
          <n-input-number v-model:value="settingStore.preferences.i2p_port" :min="0" :max="65535" class="w-40" />
        </n-form-item>

        <n-form-item :label="$t('settings.connection.i2p.mixedMode')">
          <n-checkbox v-model:checked="settingStore.preferences.i2p_mixed_mode" />
          <n-text depth="3" class="ml-2 text-xs">
            {{ $t('settings.connection.i2p.mixedModeHint') }}
          </n-text>
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.connection.proxy.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.connection.proxy.type')">
        <n-select v-model:value="settingStore.preferences.proxy_type" :options="proxyTypeOptions" class="w-40" />
        <span class="mx-4">{{ $t('settings.connection.proxy.host') }}</span>
        <n-input v-model:value="settingStore.preferences.proxy_ip" :disabled="isProxyDisabled" class="w-50" />
        <span class="mx-4">{{ $t('settings.connection.proxy.port') }}</span>
        <n-input-number
          v-model:value="settingStore.preferences.proxy_port"
          :disabled="isProxyDisabled"
          :min="1"
          :max="65535"
          class="w-40"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.proxy.hostnameLookup')">
        <n-checkbox
          v-model:checked="settingStore.preferences.proxy_hostname_lookup"
          :disabled="isProxyDisabled || isProxySocks4"
        />
      </n-form-item>

      <n-card
        :title="$t('settings.connection.proxy.authentication')"
        class="mb-4 bg-transparent!"
        :bordered="false"
        embedded
      >
        <n-form-item :label="$t('settings.connection.proxy.enableAuth')">
          <n-checkbox
            v-model:checked="settingStore.preferences.proxy_auth_enabled"
            :disabled="isProxyDisabled || isProxySocks4"
          />
        </n-form-item>

        <template v-if="settingStore.preferences.proxy_auth_enabled && !isProxyDisabled && !isProxySocks4">
          <n-form-item :label="$t('settings.connection.proxy.username')">
            <n-input v-model:value="settingStore.preferences.proxy_username" class="w-75" />
          </n-form-item>

          <n-form-item :label="$t('settings.connection.proxy.password')">
            <n-input
              v-model:value="settingStore.preferences.proxy_password"
              type="password"
              show-password-on="click"
              class="w-75"
            />
          </n-form-item>

          <n-text depth="3" class="text-xs">
            {{ $t('settings.connection.proxy.passwordHint') }}
          </n-text>
        </template>
      </n-card>

      <n-card
        :title="$t('settings.connection.proxy.bittorrent.title')"
        class="mb-4 bg-transparent!"
        :bordered="false"
        embedded
      >
        <n-form-item :label="$t('settings.connection.proxy.bittorrent.enable')">
          <n-checkbox v-model:checked="settingStore.preferences.proxy_bittorrent" :disabled="isProxyDisabled" />
        </n-form-item>

        <n-form-item :label="$t('settings.connection.proxy.bittorrent.usePeerConnections')">
          <n-checkbox
            v-model:checked="settingStore.preferences.proxy_peer_connections"
            :disabled="isProxyDisabled || !settingStore.preferences.proxy_bittorrent"
          />
        </n-form-item>
      </n-card>

      <n-form-item :label="$t('settings.connection.proxy.rss')">
        <n-checkbox v-model:checked="settingStore.preferences.proxy_rss" :disabled="isProxyDisabled || isProxySocks4" />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.proxy.misc')">
        <n-checkbox
          v-model:checked="settingStore.preferences.proxy_misc"
          :disabled="isProxyDisabled || isProxySocks4"
        />
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.connection.ipFilter.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.connection.ipFilter.filterPath')">
        <n-checkbox v-model:checked="ipFilterEnabled" class="mr-2" />
        <n-input v-model:value="settingStore.preferences.ip_filter_path" :disabled="!ipFilterEnabled" class="w-100" />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.ipFilter.trackers')">
        <n-checkbox v-model:checked="settingStore.preferences.ip_filter_trackers" />
      </n-form-item>

      <n-form-item :label="$t('settings.connection.ipFilter.bannedIPs')">
        <n-input
          v-model:value="settingStore.preferences.banned_IPs"
          type="textarea"
          :rows="5"
          :placeholder="$t('settings.connection.ipFilter.bannedIPsPlaceholder')"
          class="w-125"
        />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const settingStore = useSettingStore()
const isMobile = useIsSmallScreen()

const labelPlacement = computed(() => (isMobile.value ? 'top' : 'left'))

const protocolOptions = computed(() => [
  { label: t('settings.connection.protocol.tcpUtp'), value: 0 },
  { label: t('settings.connection.protocol.tcp'), value: 1 },
  { label: t('settings.connection.protocol.utp'), value: 2 }
])

const proxyTypeOptions = computed(() => [
  { label: t('settings.connection.proxy.typeNone'), value: 'None' },
  { label: 'SOCKS4', value: 'SOCKS4' },
  { label: 'SOCKS5', value: 'SOCKS5' },
  { label: 'HTTP', value: 'HTTP' }
])

// 连接限制启用状态
const maxConnecEnabled = computed({
  get: () => (settingStore.preferences.max_connec ?? -1) > 0,
  set: (val) => {
    if (val) {
      settingStore.preferences.max_connec = 500
    } else {
      settingStore.preferences.max_connec = -1
    }
  }
})

const maxConnecPerTorrentEnabled = computed({
  get: () => (settingStore.preferences.max_connec_per_torrent ?? -1) > 0,
  set: (val) => {
    if (val) {
      settingStore.preferences.max_connec_per_torrent = 100
    } else {
      settingStore.preferences.max_connec_per_torrent = -1
    }
  }
})

const maxUploadsEnabled = computed({
  get: () => (settingStore.preferences.max_uploads ?? -1) > 0,
  set: (val) => {
    if (val) {
      settingStore.preferences.max_uploads = 8
    } else {
      settingStore.preferences.max_uploads = -1
    }
  }
})

const maxUploadsPerTorrentEnabled = computed({
  get: () => (settingStore.preferences.max_uploads_per_torrent ?? -1) > 0,
  set: (val) => {
    if (val) {
      settingStore.preferences.max_uploads_per_torrent = 4
    } else {
      settingStore.preferences.max_uploads_per_torrent = -1
    }
  }
})

// IP 过滤启用状态
const ipFilterEnabled = computed({
  get: () => settingStore.preferences.ip_filter_enabled ?? false,
  set: (val) => {
    settingStore.preferences.ip_filter_enabled = val
  }
})

// 代理相关计算属性
const isProxyDisabled = computed(() => {
  return !settingStore.preferences.proxy_type || settingStore.preferences.proxy_type === 'None'
})

const isProxySocks4 = computed(() => {
  return settingStore.preferences.proxy_type === 'SOCKS4'
})

function generateRandomPort() {
  const min = 1024
  const max = 65535
  settingStore.preferences.listen_port = Math.floor(Math.random() * (max - min + 1) + min)
}

// 初始化默认值
onMounted(() => {
  if (settingStore.preferences.bittorrent_protocol === undefined) {
    settingStore.preferences.bittorrent_protocol = 0
  }
  if (!settingStore.preferences.listen_port) {
    settingStore.preferences.listen_port = 6881
  }
  if (settingStore.preferences.upnp === undefined) {
    settingStore.preferences.upnp = true
  }
  if (settingStore.preferences.max_connec === undefined) {
    settingStore.preferences.max_connec = -1
  }
  if (settingStore.preferences.max_connec_per_torrent === undefined) {
    settingStore.preferences.max_connec_per_torrent = -1
  }
  if (settingStore.preferences.max_uploads === undefined) {
    settingStore.preferences.max_uploads = -1
  }
  if (settingStore.preferences.max_uploads_per_torrent === undefined) {
    settingStore.preferences.max_uploads_per_torrent = -1
  }

  // I2P 设置
  if (settingStore.preferences.i2p_enabled === undefined) {
    settingStore.preferences.i2p_enabled = false
  }
  if (!settingStore.preferences.i2p_address) {
    settingStore.preferences.i2p_address = '127.0.0.1'
  }
  if (!settingStore.preferences.i2p_port) {
    settingStore.preferences.i2p_port = 7656
  }
  if (settingStore.preferences.i2p_mixed_mode === undefined) {
    settingStore.preferences.i2p_mixed_mode = false
  }

  // 代理设置
  if (!settingStore.preferences.proxy_type) {
    settingStore.preferences.proxy_type = 'None'
  }
  if (!settingStore.preferences.proxy_ip) {
    settingStore.preferences.proxy_ip = ''
  }
  if (!settingStore.preferences.proxy_port) {
    settingStore.preferences.proxy_port = 8080
  }
  if (settingStore.preferences.proxy_auth_enabled === undefined) {
    settingStore.preferences.proxy_auth_enabled = false
  }
  if (!settingStore.preferences.proxy_username) {
    settingStore.preferences.proxy_username = ''
  }
  if (!settingStore.preferences.proxy_password) {
    settingStore.preferences.proxy_password = ''
  }
  if (settingStore.preferences.proxy_hostname_lookup === undefined) {
    settingStore.preferences.proxy_hostname_lookup = false
  }
  if (settingStore.preferences.proxy_bittorrent === undefined) {
    settingStore.preferences.proxy_bittorrent = false
  }
  if (settingStore.preferences.proxy_peer_connections === undefined) {
    settingStore.preferences.proxy_peer_connections = false
  }
  if (settingStore.preferences.proxy_rss === undefined) {
    settingStore.preferences.proxy_rss = false
  }
  if (settingStore.preferences.proxy_misc === undefined) {
    settingStore.preferences.proxy_misc = false
  }

  // IP 过滤设置
  if (settingStore.preferences.ip_filter_enabled === undefined) {
    settingStore.preferences.ip_filter_enabled = false
  }
  if (!settingStore.preferences.ip_filter_path) {
    settingStore.preferences.ip_filter_path = ''
  }
  if (settingStore.preferences.ip_filter_trackers === undefined) {
    settingStore.preferences.ip_filter_trackers = false
  }
  if (!settingStore.preferences.banned_IPs) {
    settingStore.preferences.banned_IPs = ''
  }
})
</script>
