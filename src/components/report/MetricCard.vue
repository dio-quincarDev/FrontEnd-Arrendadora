<template>
  <q-card class="metric-card" :class="`bg-${color}`">
    <q-card-section class="q-pa-md text-white">
      <div class="row items-center no-wrap q-mb-sm">
        <q-icon :name="icon || 'insights'" size="md" class="q-mr-sm" />
        <div class="text-subtitle2">{{ title }}</div>
      </div>
      <div class="text-h5 q-mb-xs">
        <q-spinner v-if="loading" color="white" size="sm" class="q-mr-sm" />
        <span v-else>{{ formattedValue }}</span>
      </div>
      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: false, default: 'insights' },
  color: { type: String, default: '' },
  value: { type: [Number, String], default: null },
  isCurrency: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const formattedValue = computed(() => {
  if (props.loading) return '...'

  if (props.isCurrency) {
    const numericValue = typeof props.value === 'number' ? props.value : Number(props.value)
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'PAB',
    }).format(numericValue)
  }

  return props.value !== null && props.value !== undefined ? props.value : '--'
})
</script>

<style scoped lang="scss">
.metric-card {
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.03);
  }
}
</style>
