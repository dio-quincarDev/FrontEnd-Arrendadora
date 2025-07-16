<template>
  <q-card class="metric-card" :class="`bg-${color}`">
    <q-card-section class="q-pa-md" :class="color ? 'text-white' : 'text-dark'">
      <div class="row items-center no-wrap q-mb-sm">
        <q-icon :name="icon || 'insights'" size="md" class="q-mr-sm" />
        <div class="text-subtitle2">{{ title }}</div>
      </div>
      <div class="text-h5 q-mb-xs">
        <q-spinner v-if="loading" color="white" size="sm" class="q-mr-sm" />
        <span v-else-if="!loading && !hasSlotContent">{{ formattedValue }}</span>
        <slot v-else />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, required: false, default: 'sym_o_insights' },
  color: { type: String, default: '' },
  value: { type: [Number, String, null], default: null }, // 'value' ya NO espera Objetos aquí
  isCurrency: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

// Comprobar si hay contenido en el slot predeterminado
const slots = useSlots()
const hasSlotContent = computed(() => !!slots.default && slots.default().length > 0)

const formattedValue = computed(() => {
  if (props.loading) return '...'

  // Si es moneda
  if (props.isCurrency) {
    const numericValue = typeof props.value === 'number' ? props.value : Number(props.value)
    if (
      isNaN(numericValue) ||
      props.value === null ||
      props.value === undefined ||
      props.value === ''
    ) {
      return 'N/A' // Mostrar "N/A" para valores no válidos
    }
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'PAB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue)
  }

  // Para números o strings normales
  if (props.value !== null && props.value !== undefined && props.value !== '') {
    if (typeof props.value === 'number') {
      if (props.value >= 1000000) return `${(props.value / 1000000).toFixed(1)}M`
      if (props.value >= 1000) return `${(props.value / 1000).toFixed(1)}k`
    }
    return props.value
  }

  return 'N/A' // Valor por defecto para nulo, indefinido, o cadena vacía
})
</script>

<style scoped lang="scss">
.metric-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  color: #333;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 130px;

  &:hover {
    transform: scale(1.03);
  }
  .q-card-section {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 12px 16px;
  }
  .text-h5 {
    display: flex;
    align-items: center;
    min-height: 28px;
    line-height: 1.2;
    margin-bottom: 0px !important;
  }
  .text-subtitle2 {
    line-height: 1.2;
    margin-bottom: 4px;
  }
  .text-caption {
    line-height: 1.2;
    margin-top: 2px;
  }
}
</style>

