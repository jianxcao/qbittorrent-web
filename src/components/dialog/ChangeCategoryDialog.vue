<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('changeCategoryDialog.title', 'Set Category')"
    :close-on-esc="true"
    @close="onCancel"
    style="padding: 12px; width: 90vw; max-width: 600px"
  >
    <div class="mb-2">
      {{ $t('common.selectedCount', { count: selectedTorrents.length }, 'Selected {count} torrents') }}
    </div>
    <n-form :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120">
      <n-form-item :label="$t('changeCategoryDialog.category', 'Category')">
        <n-select
          v-model:value="category"
          :options="categoryOptions"
          :placeholder="$t('changeCategoryDialog.categoryPlaceholder', 'Select or type to create')"
          clearable
          filterable
          tag
          @update:value="onCategoryChange"
        />
      </n-form-item>

      <n-collapse-transition :show="!!isNewCategory">
        <n-form-item :label="$t('changeCategoryDialog.savePath', 'Save Path')">
          <n-auto-complete
            v-model:value="savePath"
            :options="downloadDirOptions"
            placeholder="/path/to/downloads"
            clearable
            :get-show="() => true"
          />
        </n-form-item>
      </n-collapse-transition>
    </n-form>

    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading">{{ $t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useTorrentStore } from '@/store'
import * as torrentsApi from '@/api/modules/torrents'
import { useI18n } from 'vue-i18n'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { computed, ref, watch } from 'vue'

const isMobile = useIsSmallScreen()
const labelType = computed(() => (isMobile.value ? 'top' : 'left'))
const show = defineModel<boolean>('show', { required: true })
const message = useMessage()
const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const loading = ref(false)
const category = ref<string>('')
const savePath = ref<string>('')

const selectedTorrents = computed(() => {
  return torrentStore.torrents.filter((t) => torrentStore.selectedKeys.includes(t.hash))
})

const categoryOptions = computed(() => {
  return Object.values(torrentStore.allCategories).map((cat: any) => ({
    label: cat.name,
    value: cat.name
  }))
})

const downloadDirOptions = computed(() => {
  return torrentStore.downloadDirOptions
    .filter((item: any) => item.key !== 'all')
    .map((item: any) => ({
      label: item.key,
      value: item.key
    }))
})

const isNewCategory = computed(() => {
  return category.value && !torrentStore.allCategories[category.value]
})

function onCategoryChange(val: string) {
  if (torrentStore.allCategories[val]) {
    savePath.value = torrentStore.allCategories[val].savePath
  } else {
    // New category, maybe default to current download dir
    savePath.value = ''
  }
}

watch(show, (v) => {
  if (v && selectedTorrents.value.length > 0) {
    category.value = selectedTorrents.value[0].category || ''
    if (category.value && torrentStore.allCategories[category.value]) {
      savePath.value = torrentStore.allCategories[category.value].savePath
    }
  } else {
    category.value = ''
    savePath.value = ''
  }
})

async function onConfirm() {
  loading.value = true
  try {
    // 1. If new category, create it first
    if (isNewCategory.value) {
      await torrentsApi.createCategory(category.value, savePath.value)
    }

    // 2. Set category
    await torrentsApi.setCategory(torrentStore.selectedKeys, category.value || '')

    show.value = false
    message.success($t('changeCategoryDialog.changeSuccess', 'Category changed'))
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('changeCategoryDialog.changeFailed', 'Failed to change category'))
  } finally {
    loading.value = false
  }
}

function onCancel() {
  show.value = false
}
</script>

<style scoped lang="less">
.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
