<template>
  <div class="filter-section">
    <h3>Filtrar Métricas</h3>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input v-model="startDate" type="date" label="Fecha de Inicio" outlined dense />
      </div>
      <div class="col-6">
        <q-input v-model="endDate" type="date" label="Fecha de Fin" outlined dense />
      </div>
      <div class="col-12">
        <q-select
          v-model="period"
          :options="periodOptions"
          label="Período"
          outlined
          dense
          emit-value
          map-options
          option-value="value"
          option-label="label"
        />
      </div>
      <div class="col-12 q-mt-md">
        <q-btn
          color="primary"
          label="Actualizar Métricas"
          @click="emitFilters"
          :loading="loading"
          icon="refresh"
          class="full-width"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

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

// Corregido para coincidir con los valores del backend
const periodOptions = [
  { label: 'Diario', value: 'DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Mensual', value: 'MONTHLY' },
  { label: 'Trimestral', value: 'QUARTERLY' },
  { label: 'Semestral', value: 'HALF_YEARLY' }, // Cambiado de BIANNUAL a HALF_YEARLY
  { label: 'Anual', value: 'ANNUAL' },
]

function emitFilters() {
  // Validación de fechas
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    $q.notify({
      type: 'negative',
      message: 'La fecha de inicio no puede ser mayor a la fecha fin',
      position: 'top',
    })
    return
  }

  emit('update-filters', {
    startDate: startDate.value,
    endDate: endDate.value,
    period: period.value, // Ahora recibe solo el valor (ej: 'MONTHLY')
  })
}
</script>

<style scoped>
.filter-section {
  margin-top: 32px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}
</style>
