<template>
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    :x="x"
    :y="y"
    :options="dropdownOptions"
    :show="showDropdown"
    :on-clickoutside="handleClickOutside"
    @select="handleSelect"
  />
  <AddTagDialog v-model:show="showAddTagModal" @confirm="handleAddTag" />
</template>

<script setup lang="ts">
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import { AddCircle, Trash } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref } from 'vue'
import { createTags, deleteTags } from '@/api/modules/torrents'
import { useMessage } from 'naive-ui'

const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const message = useMessage()

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const currentTagKey = ref('')
const showAddTagModal = ref(false)

const handleClickOutside = () => {
  showDropdown.value = false
}

const show = (e: MouseEvent, key: string) => {
  e.preventDefault()
  showDropdown.value = false
  nextTick().then(() => {
    showDropdown.value = true
    x.value = e.clientX
    y.value = e.clientY
    currentTagKey.value = key
  })
}

const dropdownOptions = computed(() => {
  const options = [
    {
      label: $t('sidebar.addTag'),
      key: 'add',
      icon: renderIcon(AddCircle, '#2080f0')
    }
  ]

  if (currentTagKey.value && !['tags', 'all', 'noTags'].includes(currentTagKey.value)) {
    options.push({
      label: $t('sidebar.deleteTag'),
      key: 'delete',
      icon: renderIcon(Trash, '#d03050')
    })
  }

  options.push({
    label: $t('sidebar.deleteUnusedTags'),
    key: 'deleteUnused',
    icon: renderIcon(Trash, '#d03050')
  })

  return options
})

const handleSelect = (key: string) => {
  showDropdown.value = false
  if (key === 'add') {
    showAddTagModal.value = true
  } else if (key === 'delete') {
    handleDeleteTag()
  } else if (key === 'deleteUnused') {
    handleDeleteUnused()
  }
}

const handleAddTag = async (tagName: string) => {
  try {
    await createTags([tagName])
    message.success($t('sidebar.addTagSuccess'))
    showAddTagModal.value = false
  } catch (e: any) {
    message.error(e.message || $t('sidebar.addTagFailed'))
  }
}

const handleDeleteTag = async () => {
  try {
    await deleteTags([currentTagKey.value])
    message.success($t('sidebar.deleteTagSuccess'))
    if (torrentStore.tagsFilter === currentTagKey.value) {
      torrentStore.tagsFilter = 'all'
    }
  } catch (e: any) {
    message.error(e.message || $t('sidebar.deleteTagFailed'))
  }
}

const handleDeleteUnused = async () => {
  const unusedTags = torrentStore.tagsOptions
    .filter((item: any) => item.count === 0 && !['all', 'noTags'].includes(item.key))
    .map((item: any) => item.key)

  if (unusedTags.length === 0) {
    message.info($t('sidebar.noUnusedTags'))
    return
  }

  try {
    await deleteTags(unusedTags)
    message.success($t('sidebar.deleteUnusedTagsSuccess', { count: unusedTags.length }))
    if (unusedTags.includes(torrentStore.tagsFilter)) {
      torrentStore.tagsFilter = 'all'
    }
  } catch (e: any) {
    message.error(e.message || $t('sidebar.deleteTagFailed'))
  }
}

defineExpose({
  show
})
</script>
