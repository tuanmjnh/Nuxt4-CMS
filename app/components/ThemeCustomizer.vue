<script setup lang="ts">
import { en, vi } from '@nuxt/ui/locale'

const { locale, setLocale } = useI18n()
const settings = useSettingsStore()
const isOpen = ref(false)

const side = computed(() => settings.direction === 'RTL' ? 'left' : 'right')

const handleLocaleChange = (newLocale: string) => {
  setLocale(newLocale as 'en' | 'vi')
}
// Colors
const colors = [
  { label: 'Default', value: 'blue', color: 'bg-blue-500' },
  { label: 'Green', value: 'green', color: 'bg-green-500' },
  { label: 'Red', value: 'red', color: 'bg-red-800' },
  { label: 'Rose', value: 'rose', color: 'bg-pink-400' },
  { label: 'Violet', value: 'violet', color: 'bg-violet-500' },
  { label: 'Orange', value: 'orange', color: 'bg-orange-500' },
  { label: 'Yellow', value: 'yellow', color: 'bg-yellow-500' },
  { label: 'Teal', value: 'teal', color: 'bg-teal-500' }
]

// Grays (Type)
const grays = [
  { label: 'Default', value: 'cool' },
  { label: 'Scaled', value: 'zinc' },
  { label: 'Mono', value: 'neutral' }
]

const themes = [
  { label: 'Light', value: 'light', icon: 'i-ph-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-ph-moon' },
  { label: 'System', value: 'system', icon: 'i-ph-desktop' }
]

// Layout (Mock)
const navbarTypes = ['Sidebar', 'Floating', 'Inset']
const directions = ['LTR', 'RTL']
</script>

<template>
  <div>
    <USlideover v-model:open="isOpen" :overlay="false" :side="side" :title="$t('setting.customizer')">
      <UButton icon="i-lucide-settings-2" color="neutral" variant="ghost" square @click="isOpen = true" />

      <!-- <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ $t('setting.customizer') }}
          </h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="isOpen = false" />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('setting.customize_preview') }}
        </p>
      </template> -->
      <template #body>
        <!-- <div class="p-4 space-y-6"> -->
        <!-- Theming Section -->
        <div class="flex gap-2 justify-end">
          <UColorModeSelect />
          <div class="flex-auto"></div>
          <ULocaleSelect :model-value="locale" :locales="[en, vi]" @update:model-value="handleLocaleChange" />
        </div>
        <Divider />
        <!-- Color -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-900 dark:text-white block">{{ $t('setting.color') }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="color in colors" :key="color.value"
              class="flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors" :class="[
                settings.primary === color.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              ]" @click="settings.primary = color.value">
              <span class="w-2 h-2 rounded-full" :class="color.color" />
              {{ $t('setting.colors.' + color.value) }}
            </button>
          </div>
        </div>

        <!-- Type (Gray) -->
        <div class="space-y-3 mt-4">
          <label class="text-sm font-medium text-gray-900 dark:text-white block">{{ $t('setting.type') }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="gray in grays" :key="gray.value"
              class="px-3 py-2 rounded-md border text-sm transition-colors text-center" :class="[
                settings.gray === gray.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              ]" @click="settings.gray = gray.value">
              {{ $t('setting.grays.' + gray.label.toLowerCase()) }}
            </button>
          </div>
        </div>

        <!-- Theme -->
        <!-- <div class="space-y-3 mt-4">
              <label class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('setting.theme') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="t in themes" :key="t.value"
                  class="flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors"
                  :class="[
                    theme === t.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-200'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  ]" @click="theme = t.value">
                  <UIcon :name="t.icon" class="w-4 h-4" />
                  {{ $t('setting.modes.' + t.value) }}
                </button>
              </div>
            </div> -->

        <Divider />

        <!-- Layout Section -->
        <!-- <UBadge :label="$t('setting.layout')" variant="subtle" class="mb-4" /> -->

        <!-- Navbar Type -->
        <div class="space-y-3">
          <label class="text-sm font-medium text-gray-900 dark:text-white block">{{ $t('setting.navbar_type')
          }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="type in navbarTypes" :key="type"
              class="px-3 py-2 rounded-md border text-sm transition-colors text-center" :class="[
                settings.navbarType === type
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              ]" @click="settings.navbarType = type">
              {{ $t('setting.navbars.' + type.toLowerCase()) }}
            </button>
          </div>
        </div>

        <!-- Direction -->
        <div class="space-y-3 mt-4">
          <label class="text-sm font-medium text-gray-900 dark:text-white block">{{ $t('setting.direction')
          }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="dir in directions" :key="dir"
              class="px-3 py-2 rounded-md border text-sm transition-colors text-center" :class="[
                settings.direction === dir
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-200'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              ]" @click="settings.direction = dir">
              {{ $t('setting.directions.' + dir.toLowerCase()) }}
            </button>
          </div>
        </div>
        <!-- </div> -->
      </template>
    </USlideover>
  </div>
</template>
