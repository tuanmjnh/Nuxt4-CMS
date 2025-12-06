<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair, VisArea, VisScatter } from '@unovis/vue'
import { Line } from '@unovis/ts'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Fetch stats
const { data: statsData, status } = await useAPI<any>('/api/reports/stats')

const stats = computed(() => statsData.value?.stats || {
  posts: 0,
  postViews: 0,
  postComments: 0,
  products: 0,
  productViews: 0,
  productSales: 0,
  users: 0
})

const chartData = computed(() => statsData.value?.chartData || [])

const x = (d: any) => new Date(d.date).getTime()
const yPosts = (d: any) => d.posts
const yProducts = (d: any) => d.products

const tickFormat = (date: number) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const tooltipTriggers = {
  [Line.selectors.line]: (d: any) => `
    <div class="p-2">
      <div class="font-bold mb-1">${new Date(d.date).toLocaleDateString()}</div>
      <div class="text-primary-500">${$t('content.posts')}: ${d.posts}</div>
      <div class="text-green-500">${$t('products.title')}: ${d.products}</div>
    </div>
  `
}
</script>

<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ $t('content.posts') }}</p>
            <p class="text-2xl font-bold">{{ stats.posts }}</p>
            <div class="flex gap-2 text-xs text-gray-400 mt-1">
              <span>{{ stats.postViews }} {{ $t('common.views') }}</span>
              <span>•</span>
              <span>{{ stats.postComments }} {{ $t('common.comments') }}</span>
            </div>
          </div>
          <UIcon name="i-lucide-file-text" class="text-3xl text-primary-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ $t('products.title') }}</p>
            <p class="text-2xl font-bold">{{ stats.products }}</p>
            <div class="flex gap-2 text-xs text-gray-400 mt-1">
              <span>{{ stats.productViews }} {{ $t('common.views') }}</span>
              <span>•</span>
              <span>{{ stats.productSales }} {{ $t('products.sales') || 'Sales' }}</span>
            </div>
          </div>
          <UIcon name="i-lucide-shopping-bag" class="text-3xl text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ $t('users.title') }}</p>
            <p class="text-2xl font-bold">{{ stats.users }}</p>
          </div>
          <UIcon name="i-lucide-users" class="text-3xl text-orange-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ $t('media.title') }}</p>
            <UButton to="/admin/settings/media" variant="link" :padded="false">{{ $t('common.view') }}</UButton>
          </div>
          <UIcon name="i-lucide-image" class="text-3xl text-blue-500" />
        </div>
      </UCard>
    </div>

    <!-- Charts -->
    <UCard>
      <template #header>
        <h3 class="font-bold">{{ $t('admin.growth_30_days') || 'Growth (Last 30 Days)' }}</h3>
      </template>
      <div class="h-[300px] w-full">
        <ClientOnly>
          <VisXYContainer :data="chartData" :height="300" :margin="{ left: 20, right: 20 }">
            <VisLine :x="x" :y="yPosts" color="rgb(var(--color-primary-500))" />
            <VisScatter :x="x" :y="yPosts" color="rgb(var(--color-primary-500))" :size="6" />

            <VisLine :x="x" :y="yProducts" color="rgb(var(--color-green-500))" />
            <VisScatter :x="x" :y="yProducts" color="rgb(var(--color-green-500))" :size="6" />

            <VisAxis type="x" :tickFormat="tickFormat" />
            <VisAxis type="y" />
            <VisTooltip :triggers="tooltipTriggers" />
            <VisCrosshair />
          </VisXYContainer>
        </ClientOnly>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-bold">{{ $t('common.actions') }}</h3>
      </template>
      <div class="grid gap-4 md:grid-cols-3">
        <UButton to="/admin/content/posts/create" icon="i-lucide-plus" variant="soft" block>
          {{ $t('common.create') }} {{ $t('content.posts').toLowerCase() }}
        </UButton>
        <UButton to="/admin/commerce/products/create" icon="i-lucide-plus" variant="soft" block color="success">
          {{ $t('common.create') }} {{ $t('products.title').toLowerCase() }}
        </UButton>
        <UButton to="/admin/system/users/create" icon="i-lucide-user-plus" variant="soft" block color="warning">
          {{ $t('users.create') }}
        </UButton>
      </div>
    </UCard>
  </div>
</template>
