<template>
  <n-tooltip v-if="tooltip" trigger="hover">
    <template #trigger>
      <n-button quaternary circle size="large" v-bind="$attrs" v-on="$attrs" :disabled="disabled">
        <n-icon v-if="icon" :component="icon" size="24" :color="color" />
        <slot v-else />
      </n-button>
    </template>
    {{ tooltip }}
  </n-tooltip>
  <n-button v-else quaternary circle size="large" v-bind="$attrs" v-on="$attrs" :disabled="disabled">
    <n-icon v-if="icon" :component="icon" size="24" :color="color" />
    <slot v-else />
  </n-button>
</template>
<script setup lang="ts">
import { defineProps, type Component } from 'vue'

defineProps({
  icon: { type: Object as () => Component | undefined, default: undefined },
  tooltip: { type: String, required: false },
  disabled: { type: Boolean, default: false },
  color: { type: String, required: false }
})
</script>
