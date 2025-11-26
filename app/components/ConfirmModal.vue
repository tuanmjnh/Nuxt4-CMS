<script setup lang="ts">
import { useSlots } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmClass?: string
  cancelClass?: string
}>(), {
  title: 'Confirm action',
  message: 'Are you sure you want to perform this action?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
  cancelClass: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const slots = useSlots()
const hasIconSlot = !!slots.icon
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-9998 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-[90%] max-w-md p-6 text-center animate-fade-in-up">
        <div v-if="hasIconSlot">
          <slot name="icon" />
        </div>
        <div v-else class="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4a2 2 0 00-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {{ props.title }}
        </h2>

        <div class="text-sm text-gray-600 dark:text-gray-300 mb-6">
          <slot>
            {{ props.message }}
          </slot>
        </div>

        <div class="flex justify-center gap-3">
          <button :class="['px-8 py-2 rounded-md transition', cancelClass]" @click="emit('cancel')">
            {{ props.cancelText }}
          </button>
          <button :class="['px-8 py-2 rounded-md font-medium transition', confirmClass]" @click="emit('confirm')">
            {{ props.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.25s ease;
}
</style>
