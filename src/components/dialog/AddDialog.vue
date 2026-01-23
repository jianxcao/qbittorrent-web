<template>
  <n-modal
    v-model:show="show"
    preset="dialog"
    :title="$t('addDialog.title')"
    :close-on-esc="true"
    @close="onCancel"
    style="width: 90vw; max-width: 600px; padding: 12px"
  >
    <n-el class="add-dialog-content">
      <n-form :model="form" :label-placement="labelType" :label-width="labelType === 'top' ? undefined : 120">
        <n-form-item :label="$t('addDialog.torrentFile')" required v-if="props.type === 'file'">
          <n-upload accept=".torrent" @change="onFileChange" :default-upload="false" multiple>
            <n-button>{{ $t('addDialog.selectFile') }}</n-button>
          </n-upload>
        </n-form-item>
        <n-form-item :label="$t('addDialog.magnetLink')" v-else>
          <n-input
            v-model:value="magnetLink"
            type="textarea"
            :placeholder="$t('addDialog.magnetPlaceholder')"
            :autosize="{
              minRows: 5,
              maxRows: 10
            }"
          />
        </n-form-item>

        <n-form-item :label="$t('addDialog.torrentManagementMode')">
          <n-select v-model:value="form.autoTMM" :options="autoTMMOptions" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.downloadDir')">
          <n-auto-complete
            v-model:value="form.savepath"
            :options="downloadDirOptions"
            :placeholder="$t('addDialog.downloadDirPlaceholder')"
            clearable
            :get-show="() => true"
          />
        </n-form-item>

        <n-form-item :label="$t('addDialog.category')">
          <n-select
            v-model:value="form.category"
            :options="categoryOptions"
            :placeholder="$t('addDialog.categoryPlaceholder')"
            clearable
            filterable
            tag
            @update:value="onCategoryChange"
          />
        </n-form-item>

        <n-form-item :label="$t('addDialog.rename')">
          <n-input v-model:value="form.rename" :placeholder="$t('addDialog.renamePlaceholder')" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.labels')">
          <n-select
            v-model:value="tags"
            :options="tagsOptions"
            :placeholder="$t('addDialog.labelsPlaceholder')"
            multiple
            clearable
            filterable
            tag
          />
        </n-form-item>

        <n-form-item :label="$t('addDialog.startDirectly')">
          <n-switch v-model:value="startDirectly" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.addToTopOfQueue')">
          <n-switch v-model:value="form.addToTopOfQueue" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.stopCondition')">
          <n-select v-model:value="form.stopCondition" :options="stopConditionOptions" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.skipChecking')">
          <n-switch v-model:value="form.skip_checking" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.contentLayout')">
          <n-select v-model:value="form.contentLayout" :options="contentLayoutOptions" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.sequentialDownload')">
          <n-switch v-model:value="form.sequentialDownload" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.firstLastPiecePrio')">
          <n-switch v-model:value="form.firstLastPiecePrio" />
        </n-form-item>

        <n-form-item :label="$t('addDialog.dlLimit')">
          <n-input v-model:value="form.dlLimit" placeholder="KiB/s">
            <template #suffix>KiB/s</template>
          </n-input>
        </n-form-item>

        <n-form-item :label="$t('addDialog.upLimit')">
          <n-input v-model:value="form.upLimit" placeholder="KiB/s">
            <template #suffix>KiB/s</template>
          </n-input>
        </n-form-item>
      </n-form>
    </n-el>
    <template #action>
      <n-button @click="onCancel" :loading="loading">{{ $t('common.cancel') }}</n-button>
      <n-button type="primary" @click="onConfirm" :loading="loading" :disabled="!canSubmit">{{
        $t('common.add')
      }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import * as torrentsApi from '@/api/modules/torrents'
import { useTorrentStore, useSettingStore } from '@/store'
import { sleep } from '@/utils'
import { useIsSmallScreen } from '@/composables/useIsSmallScreen'
import { useTorrentOptions } from '@/composables/useTorrentOptions'
import type { UploadFileInfo } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { computed, reactive, ref, watch } from 'vue'

const isMobile = useIsSmallScreen()
const labelType = computed(() => (isMobile.value ? 'top' : 'left'))
const torrentStore = useTorrentStore()
const settingStore = useSettingStore()
const { t: $t } = useI18n()

// 使用公共的 Torrent 选项配置
const { autoTMMOptions, contentLayoutOptions, stopConditionOptions } = useTorrentOptions()

const props = defineProps<{
  type: 'file' | 'magnet'
}>()

const show = defineModel<boolean>('show', { required: true })
const message = useMessage()
const loading = ref(false)
const magnetLink = ref('')
const torrentFiles = ref<File[]>([])
const tags = ref<string[]>([])
const startDirectly = ref(true)

const form = reactive({
  savepath: '',
  category: '',
  skip_checking: false,
  sequentialDownload: false,
  firstLastPiecePrio: false,
  autoTMM: 'false',
  rename: '',
  addToTopOfQueue: false,
  contentLayout: 'Original',
  stopCondition: 'None',
  dlLimit: '',
  upLimit: ''
})

const downloadDirOptions = computed(() => {
  // Use downloadDirFilter options but formatted for select
  return torrentStore.downloadDirOptions
    .filter((item: any) => item.key !== 'all')
    .map((item: any) => ({
      label: item.key,
      value: item.key
    }))
})

const categoryOptions = computed(() => {
  return Object.values(torrentStore.allCategories).map((cat: any) => ({
    label: cat.name,
    value: cat.name
  }))
})

const tagsOptions = computed(() => {
  return torrentStore.allTags.map((tag) => ({
    label: tag,
    value: tag
  }))
})

const canSubmit = computed(() => {
  if (props.type === 'file') {
    return torrentFiles.value.length > 0
  } else {
    return !!magnetLink.value
  }
})

function onFileChange(data: { fileList: UploadFileInfo[] }) {
  torrentFiles.value = data.fileList.map((f) => f.file as File).filter(Boolean)
}

function onCategoryChange(val: string) {
  if (form.autoTMM === 'true' && val) {
    const cat = torrentStore.allCategories[val]
    if (cat && cat.savePath) {
      form.savepath = cat.savePath
    }
  }
}

function onCancel() {
  show.value = false
}

async function onConfirm() {
  if (!canSubmit.value) {
    return
  }

  try {
    loading.value = true

    const params: any = {
      savepath: form.savepath,
      category: form.category,
      tags: tags.value.join(','),
      skip_checking: form.skip_checking,
      paused: !startDirectly.value,
      sequentialDownload: form.sequentialDownload,
      firstLastPiecePrio: form.firstLastPiecePrio,
      autoTMM: form.autoTMM === 'true',
      rename: form.rename,
      addToTopOfQueue: form.addToTopOfQueue,
      stopCondition: form.stopCondition,
      dlLimit: form.dlLimit ? Number(form.dlLimit) * 1024 : undefined,
      upLimit: form.upLimit ? Number(form.upLimit) * 1024 : undefined
    }

    if (props.type === 'file') {
      params.torrents = torrentFiles.value
    } else {
      params.urls = magnetLink.value
    }

    await torrentsApi.add(params)

    show.value = false
    message.success($t('addDialog.addSuccess'))
    await sleep(1000)
    await torrentStore.fetchTorrents()
  } catch (error) {
    console.error(error)
    message.error($t('addDialog.addFailed'))
  } finally {
    loading.value = false
  }
}

watch(show, async (v) => {
  if (v) {
    // 确保已获取 preferences
    if (!settingStore.preferences.save_path) {
      await settingStore.fetchPreferences()
    }

    const prefs = settingStore.preferences

    // 从 preferences 获取默认配置
    Object.assign(form, {
      savepath: prefs.save_path || '',
      category: '',
      skip_checking: false,
      sequentialDownload: false,
      firstLastPiecePrio: false,
      autoTMM: prefs.auto_tmm_enabled ? 'true' : 'false',
      rename: '',
      addToTopOfQueue: prefs.add_to_top_of_queue || false,
      contentLayout: prefs.torrent_content_layout || 'Original',
      stopCondition: prefs.torrent_stop_condition || 'None',
      dlLimit: '',
      upLimit: ''
    })
    magnetLink.value = ''
    torrentFiles.value = []
    tags.value = []
    // 根据 preferences 的 start_paused_enabled 设置默认是否直接开始
    startDirectly.value = !prefs.add_stopped_enabled
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';
.add-dialog-content {
  max-height: calc(100vh - 200px);
  overflow: auto;
  .scrollbar();
}
</style>
