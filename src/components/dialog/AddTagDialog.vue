<template>
  <n-modal v-model:show="show" preset="dialog" :title="$t('sidebar.addTagTitle')">
    <n-input
      v-model:value="tagName"
      :placeholder="$t('sidebar.enterTagName')"
      @keydown.enter="handleConfirm"
      autofocus
    />
    <template #action>
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm', tagName: string): void
}

const emit = defineEmits<Emits>()
const { t: $t } = useI18n()
const message = useMessage()

const show = defineModel<boolean>('show', { default: false })
const tagName = ref('')

watch(show, (newVal) => {
  if (newVal) {
    tagName.value = ''
  }
})

function handleConfirm() {
  if (!tagName.value.trim()) {
    message.warning($t('settings.tagsCategories.tags.tagNameRequired'))
    return
  }
  emit('confirm', tagName.value.trim())
}

function handleCancel() {
  show.value = false
}
</script>
