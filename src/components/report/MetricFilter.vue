<template>
  <div class="filter-section">
    <h3>Filtrar Métricas</h3>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input v-model="startDate" type="date" label="Fecha de Inicio" />
      </div>
      <div class="col-6">
        <q-input v-model="endDate" type="date" label="Fecha de Fin" />
      </div>
      <div class="col-12">
        <q-select v-model="period" :options="periodOptions" label="Período" />
      </div>
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Actualizar Métricas"
          @click="emitFilters"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const startDate = ref(null)
const endDate = ref(null)
const period = ref('MONTHLY')

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-filters'])

const periodOptions = [
  { label: 'Diario', value: 'DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Mensual', value: 'MONTHLY' },
  { label: 'Trimestral', value: 'QUARTERLY' },
  { label: 'Semestral', value: 'BIANNUAL' },
  { label: 'Anual', value: 'ANNUAL' },
]

function emitFilters() {
  emit('update-filters', {
    startDate: startDate.value,
    endDate: endDate.value,
    period: period.value,
  })
}
</script>

<style scoped>
.filter-section {
  margin-top: 32px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
}
</style>
