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

          <n-form-item path="username" :label="$t('login.username')">
            <n-input v-model:value="loginForm.username" :placeholder="$t('login.usernamePlaceholder')" clearable />
          </n-form-item>

          <n-form-item path="password" :label="$t('login.password')">
            <n-input v-model:value="loginForm.password" type="password" :placeholder="$t('login.passwordPlaceholder')"
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
  username: string
  password: string
}

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const router = useRouter()
const message = useMessage()

const loginForm = ref<LoginForm>({
  domain: settingStore.setting.domain,
  username: '',
  password: '',
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
      trigger: ['input', 'blur']
    },
    {
      min: 2,
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      trigger: ['input', 'blur']
    },
    {
      min: 1,
      trigger: ['input', 'blur']
    }
  ]
}

const onLogin = async () => {
  try {
    console.debug('loginForm', loginForm.value)
    // 先进行表单验证
    await formRef.value?.validate()

    loading.value = true

    // 设置 qBittorrent 服务器地址
    settingStore.setDomain(loginForm.value.domain)

    // 调用 qBittorrent 登录 API
    const loginSuccess = await sessionStore.login(loginForm.value.username, loginForm.value.password)

    if (loginSuccess) {
      // 保存认证信息到设置中（如果用户选择记住密码）
      message.success($t('login.loginSuccess'))
      router.push('/')
    } else {
      message.error($t('login.invalidCredentials'))
    }
  } catch (validationErrors) {
    // 如果是表单验证错误，不需要特殊处理，naive-ui 会自动显示错误信息
    if (Array.isArray(validationErrors)) {
      return
    }
    // 处理登录接口错误
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
