<template>
  <n-drawer
    v-model:show="visible"
    placement="left"
    width="85vw"
    to="body"
    :mask-closable="true"
    class="mobile-sidebar-drawer"
  >
    <n-drawer-content>
      <SidebarView class="sidebar" />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
// ==================== Model ====================
const visible = defineModel<boolean>('visible', { required: true })
</script>

<style lang="less" scoped>
@import '@/styles/mix.less';

.mobile-sidebar-drawer {
  height: 100vh;
  height: 100dvh;
  padding-top: var(--top-inset);
  padding-bottom: var(--bottom-inset);
  overflow: hidden;
}

.sidebar {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  // 美化滚动条
  .scrollbar();
}
</style>
