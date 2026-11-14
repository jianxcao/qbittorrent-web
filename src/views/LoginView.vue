<template>
  <div class="flex items-center justify-center min-h-screen">
    <n-card class="w-[420px] rounded-lg shadow-lg login-card">
      <h2 class="text-xl font-bold mb-6 text-center">{{ $t('login.title') }}</h2>
      <n-form ref="formRef" :model="loginForm" :rules="rules" size="large" label-placement="left" :show-feedback="false"
        :show-label="false">
        <n-space vertical size="large">
          <n-form-item path="domain" :label="$t('login.serverUrl')">
            <n-input v-model:value="loginForm.domain" :placeholder="$t('login.serverUrlPlaceholder')" clearable />
          </n-form-item>

          <n-form-item>
            <n-radio-group v-model:value="loginForm.authMode" name="authMode">
              <n-radio-button value="password">{{ $t('login.passwordMode') }}</n-radio-button>
              <n-radio-button value="apiKey">{{ $t('login.apiKeyMode') }}</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <template v-if="loginForm.authMode === 'password'">
            <n-form-item path="username" :label="$t('login.username')">
              <n-input v-model:value="loginForm.username" :placeholder="$t('login.usernamePlaceholder')" clearable />
            </n-form-item>

            <n-form-item path="password" :label="$t('login.password')">
              <n-input v-model:value="loginForm.password" type="password" :placeholder="$t('login.passwordPlaceholder')"
                show-password-on="click" @keyup.enter="onLogin" />
            </n-form-item>
          </template>

          <n-form-item v-else path="apiKey" :label="$t('login.apiKey')">
            <n-input v-model:value="loginForm.apiKey" type="password" :placeholder="$t('login.apiKeyPlaceholder')"
              show-password-on="click" @keyup.enter="onLogin" />
          </n-form-item>
          <!--
          <n-form-item>
            <n-checkbox v-model:checked="loginForm.rememberPassword">{{ $t('login.rememberPassword') }}</n-checkbox>
          </n-form-item> -->

          <n-form-item>
            <n-button type="primary" size="large" block @click="onLogin" :loading="loading">{{
              $t('login.loginButton')
            }}</n-button>
          </n-form-item>
        </n-space>
      </n-form>

      <!-- 语言切换器 -->
      <div class="switcher-container">
        <LanguageSwitcher />
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/store'
import { useSessionStore } from '@/store/session'
import type { FormInst, FormRules } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
const settingStore = useSettingStore()
const sessionStore = useSessionStore()
const { t: $t } = useI18n()

interface LoginForm {
  domain: string
  authMode: 'password' | 'apiKey'
  username: string
  password: string
  apiKey: string
}

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const router = useRouter()
const message = useMessage()

const loginForm = ref<LoginForm>({
  domain: settingStore.setting.domain,
  authMode: settingStore.setting.apiKey ? 'apiKey' : 'password',
  username: '',
  password: '',
  apiKey: settingStore.setting.apiKey || ''
})

// 表单验证规则
const rules: FormRules = {
  domain: [
    {
      required: true,
      trigger: ['input', 'blur']
    },
    {
      pattern: /^https?:\/\/.+/,
      trigger: ['input', 'blur']
    }
  ],
  username: [
    {
      required: true,
      trigger: ['input', 'blur'],
      validator: (_rule, value: string) => loginForm.value.authMode !== 'password' || value.length >= 2
    }
  ],
  password: [
    {
      required: true,
      trigger: ['input', 'blur'],
      validator: (_rule, value: string) => loginForm.value.authMode !== 'password' || !!value
    }
  ],
  apiKey: [
    {
      required: true,
      trigger: ['input', 'blur'],
      validator: (_rule, value: string) => loginForm.value.authMode !== 'apiKey' || !!value?.trim()
    }
  ]
}

const onLogin = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    settingStore.setDomain(loginForm.value.domain)

    const loginSuccess = loginForm.value.authMode === 'apiKey'
      ? await sessionStore.loginWithApiKey(loginForm.value.apiKey)
      : await sessionStore.login(loginForm.value.username, loginForm.value.password)

    if (loginSuccess) {
      if (loginForm.value.authMode === 'apiKey') {
        settingStore.setApiKeyValue(loginForm.value.apiKey)
      } else {
        settingStore.setApiKeyValue('')
      }
      message.success($t('login.loginSuccess'))
      router.push('/')
    } else {
      message.error(loginForm.value.authMode === 'apiKey' ? $t('login.invalidApiKey') : $t('login.invalidCredentials'))
    }
  } catch (validationErrors) {
    if (Array.isArray(validationErrors)) {
      return
    }
    message.error($t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 尝试获取 qBittorrent 应用版本来检查是否已登录
  try {
    await sessionStore.fetchVersion()
    // 如果能成功获取到设置，说明已经登录
    router.replace('/')
  } catch {
    // 如果获取失败，说明未登录，保持在登录页面
  }
})
</script>

<style scoped lang="less">
.login-card {
  position: relative;
  -webkit-backdrop-filter: blur(10px) brightness(95%);
  backdrop-filter: blur(10px) brightness(95%);
  background-color: color-mix(in srgb, var(--n-color) 50%, transparent 80%);

  .switcher-container {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
</style>
