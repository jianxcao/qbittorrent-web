<template>
  <n-modal v-model:show="show" preset="dialog" :title="$t('sidebar.addCategoryTitle')">
    <n-form ref="formRef" :model="formValue" :rules="rules">
      <n-form-item :label="$t('sidebar.enterCategoryName')" path="category">
        <n-input
          v-model:value="formValue.category"
          :placeholder="$t('settings.tagsCategories.categories.categoryNamePlaceholder')"
          @keydown.enter="handleConfirm"
          autofocus
        />
      </n-form-item>
      <n-form-item :label="$t('sidebar.enterSavePath')" path="savePath">
        <n-input
          v-model:value="formValue.savePath"
          :placeholder="$t('settings.tagsCategories.categories.savePathPlaceholder')"
          @keydown.enter="handleConfirm"
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { type FormInst } from 'naive-ui'
import { useI18n } from 'vue-i18n'

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm', data: { category: string; savePath: string }): void
}

const emit = defineEmits<Emits>()
const { t: $t } = useI18n()
const show = defineModel<boolean>('show', { default: false })
const formRef = ref<FormInst | null>(null)
const formValue = reactive({
  category: '',
  savePath: ''
})

const rules = {
  category: {
    required: true,
    message: $t('settings.tagsCategories.categories.categoryNameRequired'),
    trigger: ['input', 'blur']
  }
}

watch(show, (newVal) => {
  if (newVal) {
    formValue.category = ''
    formValue.savePath = ''
  }
})

function handleConfirm() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      emit('confirm', {
        category: formValue.category.trim(),
        savePath: formValue.savePath.trim()
      })
    }
  })
}

function handleCancel() {
  show.value = false
}
</script>
