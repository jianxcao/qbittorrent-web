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
  <AddCategoryDialog v-model:show="showAddCategoryModal" @confirm="handleAddCategory" />
</template>

<script setup lang="ts">
import { useTorrentStore } from '@/store'
import { renderIcon } from '@/utils'
import { AddCircle, Trash } from '@vicons/ionicons5'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref } from 'vue'
import { createCategory, removeCategories } from '@/api/modules/torrents'
import { useMessage } from 'naive-ui'

const torrentStore = useTorrentStore()
const { t: $t } = useI18n()
const message = useMessage()

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const currentCategoryKey = ref('')
const showAddCategoryModal = ref(false)

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
    currentCategoryKey.value = key
  })
}

const dropdownOptions = computed(() => {
  const options = [
    {
      label: $t('sidebar.addCategory'),
      key: 'add',
      icon: renderIcon(AddCircle, '#2080f0')
    }
  ]

  if (currentCategoryKey.value && !['categories', 'all', 'noCategory'].includes(currentCategoryKey.value)) {
    options.push({
      label: $t('sidebar.deleteCategory'),
      key: 'delete',
      icon: renderIcon(Trash, '#d03050')
    })
  }

  options.push({
    label: $t('sidebar.deleteUnusedCategories'),
    key: 'deleteUnused',
    icon: renderIcon(Trash, '#d03050')
  })

  return options
})

const handleSelect = (key: string) => {
  showDropdown.value = false
  if (key === 'add') {
    showAddCategoryModal.value = true
  } else if (key === 'delete') {
    handleDeleteCategory()
  } else if (key === 'deleteUnused') {
    handleDeleteUnused()
  }
}

const handleAddCategory = async (data: { category: string; savePath: string }) => {
  try {
    await createCategory(data.category, data.savePath)
    message.success($t('sidebar.addCategorySuccess'))
    showAddCategoryModal.value = false
  } catch (e: any) {
    message.error(e.message || $t('sidebar.addCategoryFailed'))
  }
}

const handleDeleteCategory = async () => {
  try {
    await removeCategories([currentCategoryKey.value])
    message.success($t('sidebar.deleteCategorySuccess'))
    if (torrentStore.categoryFilter === currentCategoryKey.value) {
      torrentStore.categoryFilter = 'all'
    }
  } catch (e: any) {
    message.error(e.message || $t('sidebar.deleteCategoryFailed'))
  }
}

const handleDeleteUnused = async () => {
  const unusedCategories = torrentStore.categoryOptions
    .filter((item: any) => item.count === 0 && !['all', 'noCategory'].includes(item.key))
    .map((item: any) => item.key)

  if (unusedCategories.length === 0) {
    message.info($t('sidebar.noUnusedCategories'))
    return
  }

  try {
    await removeCategories(unusedCategories)
    message.success($t('sidebar.deleteUnusedCategoriesSuccess', { count: unusedCategories.length }))
    if (unusedCategories.includes(torrentStore.categoryFilter)) {
      torrentStore.categoryFilter = 'all'
    }
  } catch (e: any) {
    message.error(e.message || $t('sidebar.deleteCategoryFailed'))
  }
}

defineExpose({
  show
})
</script>
