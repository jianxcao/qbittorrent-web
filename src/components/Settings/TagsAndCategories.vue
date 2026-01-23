<template>
  <div>
    <n-space vertical :size="24">
      <!-- 标签管理 -->
      <n-card :title="$t('settings.tagsCategories.tags.title')" :bordered="false" size="small">
        <template #header-extra>
          <n-space>
            <n-button type="primary" size="small" @click="showAddTagDialog = true">
              {{ $t('settings.tagsCategories.tags.addTag') }}
            </n-button>
            <n-button size="small" @click="deleteUnusedTags">
              {{ $t('settings.tagsCategories.tags.deleteUnused') }}
            </n-button>
          </n-space>
        </template>
        <n-space v-if="tags.length > 0" :size="[8, 8]">
          <n-tag v-for="tag in tags" :key="tag.tag" type="info" :bordered="false" closable @close="deleteTag(tag.tag)">
            <template #icon>
              <span style="font-size: 12px; opacity: 0.6; margin-right: 4px">{{ tag.count }}</span>
            </template>
            {{ tag.tag }}
          </n-tag>
        </n-space>
        <n-empty v-else :description="$t('settings.tagsCategories.tags.noTags')" size="small" style="padding: 20px 0" />
      </n-card>

      <!-- 分类管理 -->
      <n-card :title="$t('settings.tagsCategories.categories.title')" :bordered="false" size="small">
        <template #header-extra>
          <n-space>
            <n-button type="primary" size="small" @click="showAddCategoryDialog = true">
              {{ $t('settings.tagsCategories.categories.addCategory') }}
            </n-button>
            <n-button size="small" @click="deleteUnusedCategories">
              {{ $t('settings.tagsCategories.categories.deleteUnused') }}
            </n-button>
          </n-space>
        </template>
        <n-space v-if="categories.length > 0" :size="8">
          <div v-for="category in categories" :key="category.name" class="category-item">
            <n-space align="center" :size="12">
              <n-tag type="success" :bordered="false" closable @close="deleteCategory(category.name)">
                <template #icon>
                  <span style="font-size: 12px; opacity: 0.6; margin-right: 4px">{{ category.count }}</span>
                </template>
                {{ category.name }}
              </n-tag>
              <n-text depth="3" style="font-size: 12px">{{ category.savePath }}</n-text>
            </n-space>
          </div>
        </n-space>
        <n-empty
          v-else
          :description="$t('settings.tagsCategories.categories.noCategories')"
          size="small"
          style="padding: 20px 0"
        />
      </n-card>
    </n-space>

    <!-- 添加标签对话框 -->
    <AddTagDialog v-model:show="showAddTagDialog" @confirm="handleAddTag" />

    <!-- 添加分类对话框 -->
    <AddCategoryDialog v-model:show="showAddCategoryDialog" @confirm="handleAddCategory" />
  </div>
</template>

<script setup lang="ts">
import { useTorrentStore } from '@/store'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import * as torrentsApi from '@/api/modules/torrents'
import type { Category, Torrent } from '@/api/types'

const { t } = useI18n()
const torrentStore = useTorrentStore()
const message = useMessage()

const showAddTagDialog = ref(false)
const showAddCategoryDialog = ref(false)

const tags = computed(() => {
  return torrentStore.allTags.map((tag: string) => ({
    tag,
    count: torrentStore.torrents.filter((t: Torrent) => t.tags.includes(tag)).length
  }))
})

const categories = computed(() => {
  return Object.entries(torrentStore.allCategories).map(([name, info]) => ({
    name,
    savePath: (info as Category).savePath,
    count: torrentStore.torrents.filter((t: Torrent) => t.category === name).length
  }))
})

async function handleAddTag(tagName: string) {
  try {
    await torrentsApi.createTags([tagName])
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.tags.addSuccess'))
    showAddTagDialog.value = false
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.tags.addFailed'))
  }
}

async function deleteTag(tag: string) {
  try {
    await torrentsApi.deleteTags([tag])
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.tags.deleteSuccess'))
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.tags.deleteFailed'))
  }
}

async function deleteUnusedTags() {
  const unusedTags = tags.value.filter((t) => t.count === 0).map((t) => t.tag)
  if (unusedTags.length === 0) {
    message.info(t('settings.tagsCategories.tags.noUnusedTags'))
    return
  }
  try {
    await torrentsApi.deleteTags(unusedTags)
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.tags.deleteUnusedSuccess', { count: unusedTags.length }))
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.tags.deleteUnusedFailed'))
  }
}

async function handleAddCategory(data: { category: string; savePath: string }) {
  try {
    await torrentsApi.createCategory(data.category, data.savePath)
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.categories.addSuccess'))
    showAddCategoryDialog.value = false
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.categories.addFailed'))
  }
}

async function deleteCategory(category: string) {
  try {
    await torrentsApi.removeCategories([category])
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.categories.deleteSuccess'))
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.categories.deleteFailed'))
  }
}

async function deleteUnusedCategories() {
  const unusedCategories = categories.value.filter((c) => c.count === 0).map((c) => c.name)
  if (unusedCategories.length === 0) {
    message.info(t('settings.tagsCategories.categories.noUnusedCategories'))
    return
  }
  try {
    await torrentsApi.removeCategories(unusedCategories)
    await torrentStore.fetchTorrents()
    message.success(t('settings.tagsCategories.categories.deleteUnusedSuccess', { count: unusedCategories.length }))
  } catch (error) {
    console.error(error)
    message.error(t('settings.tagsCategories.categories.deleteUnusedFailed'))
  }
}

// 初始化时获取分类和标签
onMounted(async () => {
  if (!torrentStore.torrents.length) {
    await torrentStore.fetchTorrents()
  }
})
</script>

<style scoped>
.category-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}
</style>
