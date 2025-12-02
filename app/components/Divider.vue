<script setup>
import { useSlots } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  spacing: {
    type: String,
    default: 'my-6'
  }
});

const slots = useSlots();
const hasContent = computed(() => !!props.label || !!slots.default);

import { computed } from 'vue';
</script>

<template>
  <div :class="['relative flex items-center w-full', spacing]">

    <div class="grow border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"></div>

    <span v-if="hasContent"
      class="shrink-0 mx-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
      <slot>{{ label }}</slot>
    </span>

    <div v-if="hasContent" class="grow border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
    </div>

  </div>
</template>