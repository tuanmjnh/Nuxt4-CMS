<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisStackedBar, VisTooltip } from '@unovis/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: reportData, pending: loading } = await useAPI<any>('/api/reports/inventory')

const stats = computed(() => reportData.value?.stats || [])
const dailyStats = computed(() => reportData.value?.dailyStats || [])

const x = (d: any) => new Date(d._id).getTime()
const yImport = (d: any) => d.import
const yExport = (d: any) => d.export

const tickFormat = (date: number) => new Date(date).toLocaleDateString()
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ $t('reports.inventory_title') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <UCard v-for="stat in stats" :key="stat._id">
        <div class="text-center">
          <h3 class="text-lg font-semibold capitalize">{{ $t(`inventory.${stat._id}`) }}</h3>
          <p class="text-3xl font-bold">{{ stat.count }}</p>
          <p class="text-gray-500">{{ $t('reports.transactions') }}</p>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <h3 class="text-lg font-bold">{{ $t('reports.daily_activity') }}</h3>
      </template>
      <div class="h-96" v-if="dailyStats.length > 0">
        <VisXYContainer :data="dailyStats">
          <VisLine :x="x" :y="yImport" color="green" />
          <VisLine :x="x" :y="yExport" color="red" />
          <VisAxis type="x" :tickFormat="tickFormat" />
          <VisAxis type="y" />
          <VisTooltip />
        </VisXYContainer>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        {{ $t('common.no_data') }}
      </div>
    </UCard>
  </div>
</template>
