<template>
  <div class="filter-section q-pa-md">
    <div class="row q-col-gutter-sm items-center">
      <div class="col-12 col-md-4" v-if="period !== 'ALL_TIME'">
        <q-date v-model="dateRange" range mask="YYYY-MM-DD" color="primary" today-btn flat bordered>
          <template v-slot:default>
            <div class="row justify-between">
              <q-btn label="Últimos 7 días" flat color="primary" @click="setRelativeDateRange(7)" />
              <q-btn label="Este mes" flat color="primary" @click="setCurrentMonth" />
            </div>
          </template>
        </q-date>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="period"
          :options="periodOptions"
          label="Agrupación"
          outlined
          dense
          options-dense
          emit-value
          map-options
          option-value="value"
          option-label="label"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                {{ scope.opt.label }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-2">
        <q-select
          v-model="format"
          :options="formatOptions"
          label="Formato Gráfico"
          outlined
          dense
          options-dense
          emit-value
          map-options
          option-value="value"
          option-label="label"
        />
      </div>

      <div class="col-12 col-md-3">
        <q-btn
          color="primary"
          label="Aplicar Filtros"
          icon="filter_alt"
          @click="emitFilters"
          :loading="loading"
          class="full-width"
          unelevated
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useQuasar } from 'quasar'
import { endOfMonth, startOfMonth, subDays } from 'date-fns'

const $q = useQuasar()
const emit = defineEmits(['update-filters'])

// Estados reactivos
const dateRange = ref({
  from: startOfMonth(new Date()).toISOString().split('T')[0],
  to: endOfMonth(new Date()).toISOString().split('T')[0],
})
const period = ref('ALL_TIME')
const format = ref('CHART_PNG') // Valor por defecto para el formato del gráfico
const loading = ref(false) // Si necesitas un estado de carga para los filtros

// Opciones de periodo
const periodOptions = [
  { label: 'Todo el Tiempo', value: 'ALL_TIME', icon: 'history' },
  { label: 'Diario', value: 'DAILY', icon: 'event_available' },
  { label: 'Semanal', value: 'WEEKLY', icon: 'date_range' },
  { label: 'Mensual', value: 'MONTHLY', icon: 'calendar_month' },
  { label: 'Trimestral', value: 'QUARTERLY', icon: 'event_repeat' },
]

// Opciones de formato para el gráfico (para el chartType)
const formatOptions = [
  { label: 'PNG', value: 'CHART_PNG' },
  { label: 'SVG', value: 'CHART_SVG' },
  { label: 'JSON', value: 'CHART_JSON' },
]

// Métodos
const setRelativeDateRange = (days) => {
  const end = new Date()
  const start = subDays(end, days)
  dateRange.value = {
    from: start.toISOString().split('T')[0],
    to: end.toISOString().split('T')[0],
  }
}

const setCurrentMonth = () => {
  dateRange.value = {
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0],
  }
}

// NUEVO emitFilters
const emitFilters = () => {
  let from = null
  let to = null

  if (period.value !== 'ALL_TIME') {
    from = dateRange.value.from
    to = dateRange.value.to

    if (!from || !to) {
      $q.notify({
        type: 'negative',
        message: 'Seleccione un rango de fechas válido',
        position: 'top',
      })
      return
    }
  }

  emit('update-filters', {
    startDate: from,
    endDate: to,
    period: period.value,
    chartType: ['CHART_PNG', 'CHART_SVG'].includes(format.value) ? 'bar' : undefined,
    format: format.value,
  })
}
</script>

<style scoped>
.filter-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
}

.q-date {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
