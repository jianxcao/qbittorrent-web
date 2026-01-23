<template>
  <div>
    <n-form :label-placement="labelPlacement" :label-width="280">
      <n-divider title-placement="left">
        {{ $t('settings.webui.httpServer.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.httpServer.ipAddress')">
        <n-input v-model:value="settingStore.preferences.web_ui_address" style="width: 240px" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.httpServer.port')">
        <n-input-number
          v-model:value="settingStore.preferences.web_ui_port"
          :min="1"
          :max="65535"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.httpServer.useUPnP')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_upnp" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.httpServer.useHTTPS')">
        <n-checkbox v-model:checked="settingStore.preferences.use_https" />
      </n-form-item>

      <template v-if="settingStore.preferences.use_https">
        <n-form-item :label="$t('settings.webui.httpServer.certificate')">
          <n-input v-model:value="settingStore.preferences.web_ui_https_cert_path" style="width: 100%" />
        </n-form-item>

        <n-form-item :label="$t('settings.webui.httpServer.key')">
          <n-input v-model:value="settingStore.preferences.web_ui_https_key_path" style="width: 100%" />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.webui.authentication.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.authentication.username')">
        <n-input :value="settingStore.preferences.web_ui_username" disabled style="width: 240px" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.authentication.password')">
        <n-input
          v-model:value="newPassword"
          type="password"
          :placeholder="$t('settings.webui.authentication.passwordPlaceholder')"
          style="width: 240px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.authentication.bypassLocalAuth')">
        <n-checkbox v-model:checked="settingStore.preferences.bypass_local_auth" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.authentication.bypassAuthSubnetWhitelist')">
        <n-checkbox v-model:checked="settingStore.preferences.bypass_auth_subnet_whitelist_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.bypass_auth_subnet_whitelist_enabled">
        <n-form-item :label="$t('settings.webui.authentication.subnetWhitelist')">
          <n-input
            v-model:value="settingStore.preferences.bypass_auth_subnet_whitelist"
            type="textarea"
            :placeholder="$t('settings.webui.authentication.subnetWhitelistPlaceholder')"
            :rows="3"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-form-item :label="$t('settings.webui.authentication.maxAuthFailCount')">
        <n-input-number
          v-model:value="settingStore.preferences.web_ui_max_auth_fail_count"
          :min="0"
          style="width: 160px"
        />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.authentication.banDuration')">
        <n-input-number v-model:value="settingStore.preferences.web_ui_ban_duration" :min="1" style="width: 160px">
          <template #suffix>{{ $t('settings.webui.authentication.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.webui.authentication.sessionTimeout')">
        <n-input-number v-model:value="settingStore.preferences.web_ui_session_timeout" :min="1" style="width: 160px">
          <template #suffix>{{ $t('settings.webui.authentication.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-divider title-placement="left">
        {{ $t('settings.webui.alternativeUI.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.alternativeUI.useAlternativeUI')">
        <n-checkbox v-model:checked="settingStore.preferences.alternative_webui_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.alternative_webui_enabled">
        <n-form-item :label="$t('settings.webui.alternativeUI.filesLocation')">
          <n-input v-model:value="settingStore.preferences.alternative_webui_path" style="width: 100%" />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.webui.security.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.security.clickjackingProtection')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_clickjacking_protection_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.security.csrfProtection')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_csrf_protection_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.security.secureCookie')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_secure_cookie_enabled" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.security.hostHeaderValidation')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_host_header_validation_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.web_ui_host_header_validation_enabled">
        <n-form-item :label="$t('settings.webui.security.serverDomains')">
          <n-input
            v-model:value="settingStore.preferences.web_ui_domain_list"
            type="textarea"
            :placeholder="$t('settings.webui.security.serverDomainsPlaceholder')"
            :rows="2"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.webui.customHeaders.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.customHeaders.useCustomHeaders')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_use_custom_http_headers_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.web_ui_use_custom_http_headers_enabled">
        <n-form-item :label="$t('settings.webui.customHeaders.headers')">
          <n-input
            v-model:value="settingStore.preferences.web_ui_custom_http_headers"
            type="textarea"
            :placeholder="$t('settings.webui.customHeaders.headersPlaceholder')"
            :rows="4"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.webui.reverseProxy.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.reverseProxy.enableReverseProxy')">
        <n-checkbox v-model:checked="settingStore.preferences.web_ui_reverse_proxy_enabled" />
      </n-form-item>

      <template v-if="settingStore.preferences.web_ui_reverse_proxy_enabled">
        <n-form-item :label="$t('settings.webui.reverseProxy.trustedProxies')">
          <n-input
            v-model:value="settingStore.preferences.web_ui_reverse_proxies_list"
            :placeholder="$t('settings.webui.reverseProxy.trustedProxiesPlaceholder')"
            style="width: 100%"
          />
        </n-form-item>
      </template>

      <n-divider title-placement="left">
        {{ $t('settings.webui.frontend.title') }}
      </n-divider>

      <n-form-item :label="$t('settings.webui.frontend.language')">
        <n-select v-model:value="settingStore.setting.language" :options="languageOptions" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.frontend.theme')">
        <n-select v-model:value="settingStore.setting.theme" :options="themeOptions" @update:value="onThemeChange" />
      </n-form-item>

      <n-form-item :label="$t('settings.webui.frontend.torrentListRefreshInterval')">
        <n-input-number
          v-model:value="settingStore.setting.polling.torrentInterval"
          :min="1"
          :max="60"
          style="width: 160px"
        >
          <template #suffix>{{ $t('settings.webui.frontend.seconds') }}</template>
        </n-input-number>
      </n-form-item>

      <n-form-item :label="$t('settings.webui.frontend.torrentDetailRefreshInterval')">
        <n-input-number
          v-model:value="settingStore.setting.polling.torrentDetailInterval"
          :min="1"
          :max="60"
          style="width: 160px"
        >
          <template #suffix>{{ $t('settings.webui.frontend.seconds') }}</template>
        </n-input-number>
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
const newPassword = ref('')

const languageOptions = computed(() => [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
])

const themeOptions = computed(() => [
  { label: $t('settings.webui.frontend.themeLight'), value: 'light' },
  { label: $t('settings.webui.frontend.themeDark'), value: 'dark' }
])

function onThemeChange(theme: string) {
  settingStore.setTheme(theme)
}

// 初始化默认值
onMounted(() => {
  // HTTP Server
  if (!settingStore.preferences.web_ui_address) {
    settingStore.preferences.web_ui_address = '*'
  }
  if (!settingStore.preferences.web_ui_port) {
    settingStore.preferences.web_ui_port = 8080
  }
  if (settingStore.preferences.web_ui_upnp === undefined) {
    settingStore.preferences.web_ui_upnp = false
  }
  if (settingStore.preferences.use_https === undefined) {
    settingStore.preferences.use_https = false
  }
  if (!settingStore.preferences.web_ui_https_cert_path) {
    settingStore.preferences.web_ui_https_cert_path = ''
  }
  if (!settingStore.preferences.web_ui_https_key_path) {
    settingStore.preferences.web_ui_https_key_path = ''
  }

  // Authentication
  if (!settingStore.preferences.web_ui_username) {
    settingStore.preferences.web_ui_username = 'admin'
  }
  if (settingStore.preferences.bypass_local_auth === undefined) {
    settingStore.preferences.bypass_local_auth = false
  }
  if (settingStore.preferences.bypass_auth_subnet_whitelist_enabled === undefined) {
    settingStore.preferences.bypass_auth_subnet_whitelist_enabled = false
  }
  if (!settingStore.preferences.bypass_auth_subnet_whitelist) {
    settingStore.preferences.bypass_auth_subnet_whitelist = ''
  }
  if (settingStore.preferences.web_ui_max_auth_fail_count === undefined) {
    settingStore.preferences.web_ui_max_auth_fail_count = 5
  }
  if (settingStore.preferences.web_ui_ban_duration === undefined) {
    settingStore.preferences.web_ui_ban_duration = 3600
  }
  if (settingStore.preferences.web_ui_session_timeout === undefined) {
    settingStore.preferences.web_ui_session_timeout = 3600
  }

  // Alternative WebUI
  if (settingStore.preferences.alternative_webui_enabled === undefined) {
    settingStore.preferences.alternative_webui_enabled = false
  }
  if (!settingStore.preferences.alternative_webui_path) {
    settingStore.preferences.alternative_webui_path = ''
  }

  // Security
  if (settingStore.preferences.web_ui_clickjacking_protection_enabled === undefined) {
    settingStore.preferences.web_ui_clickjacking_protection_enabled = true
  }
  if (settingStore.preferences.web_ui_csrf_protection_enabled === undefined) {
    settingStore.preferences.web_ui_csrf_protection_enabled = true
  }
  if (settingStore.preferences.web_ui_secure_cookie_enabled === undefined) {
    settingStore.preferences.web_ui_secure_cookie_enabled = true
  }
  if (settingStore.preferences.web_ui_host_header_validation_enabled === undefined) {
    settingStore.preferences.web_ui_host_header_validation_enabled = true
  }
  if (!settingStore.preferences.web_ui_domain_list) {
    settingStore.preferences.web_ui_domain_list = ''
  }

  // Custom HTTP Headers
  if (settingStore.preferences.web_ui_use_custom_http_headers_enabled === undefined) {
    settingStore.preferences.web_ui_use_custom_http_headers_enabled = false
  }
  if (!settingStore.preferences.web_ui_custom_http_headers) {
    settingStore.preferences.web_ui_custom_http_headers = ''
  }

  // Reverse Proxy
  if (settingStore.preferences.web_ui_reverse_proxy_enabled === undefined) {
    settingStore.preferences.web_ui_reverse_proxy_enabled = false
  }
  if (!settingStore.preferences.web_ui_reverse_proxies_list) {
    settingStore.preferences.web_ui_reverse_proxies_list = ''
  }

  // Frontend
  if (!settingStore.preferences.locale) {
    settingStore.preferences.locale = 'zh-CN'
  }
  if (!settingStore.setting.polling) {
    settingStore.setting.polling = {
      torrentInterval: 3,
      torrentDetailInterval: 3
    }
  }
})

// 监听密码修改
watch(newPassword, (val) => {
  if (val && val.length > 0) {
    settingStore.preferences.web_ui_password = val
  }
})
</script>
