<template>
  <q-card class="filter-card q-pa-md">
    <q-card-section class="q-pb-sm">
      <div class="text-h6 text-primary">Filtros de Dashboard</div>
    </q-card-section>

    <q-card-section class="q-pt-sm">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-md-4 col-lg-3">
          <q-select
            v-model="period"
            :options="periodOptions"
            label="Agrupación por Periodo"
            outlined
            dense
            options-dense
            emit-value
            map-options
            option-value="value"
            option-label="label"
            color="primary"
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

        <div class="col-12 col-md-4 col-lg-4" v-if="period !== 'ALL_TIME'">
          <q-input
            filled
            dense
            v-model="dateRangeDisplay"
            label="Rango de Fechas"
            mask="date"
            :rules="['date']"
            color="primary"
            readonly
          >
            <template v-slot:append>
              <q-icon name="sym_o_event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="dateRange"
                    range
                    mask="YYYY-MM-DD"
                    color="primary"
                    today-btn
                    flat
                    bordered
                  >
                    <template v-slot:default>
                      <div class="row justify-between">
                        <q-btn
                          label="Últimos 7 días"
                          flat
                          color="primary"
                          @click="setRelativeDateRange(7)"
                        />
                        <q-btn
                          label="Últimos 30 días"
                          flat
                          color="primary"
                          @click="setRelativeDateRange(30)"
                        />
                        <q-btn label="Este mes" flat color="primary" @click="setCurrentMonth" />
                        <q-btn label="Este año" flat color="primary" @click="setCurrentYear" />
                      </div>
                    </template>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4 col-lg-3">
          <q-select
            v-model="reportTypeToDownload"
            :options="reportTypeOptions"
            label="Tipo de Reporte a Descargar"
            outlined
            dense
            options-dense
            emit-value
            map-options
            option-value="value"
            option-label="label"
            color="secondary"
          />
        </div>

        <div class="col-12 col-md-4 col-lg-2">
          <q-btn
            color="primary"
            label="Aplicar Filtros"
            icon="sym_o_filter_alt"
            @click="emitFilters"
            :loading="props.loading"
            class="full-width q-py-sm"
            unelevated
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, defineEmits, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  endOfMonth,
  startOfMonth,
  subDays,
  startOfYear,
  endOfYear,
  format as formatDateFns,
} from 'date-fns'

const $q = useQuasar()
const emit = defineEmits(['update-filters'])

// Props
const props = defineProps({
  loading: { type: Boolean, default: false }, // Prop para el estado de carga externo
})

// Estados reactivos
const dateRange = ref({
  from: startOfMonth(new Date()).toISOString().split('T')[0],
  to: endOfMonth(new Date()).toISOString().split('T')[0],
})
const period = ref('ALL_TIME')
const reportTypeToDownload = ref('RENTAL_SUMMARY') // Valor por defecto para el tipo de reporte

// Opciones de periodo
const periodOptions = [
  { label: 'Todo el Tiempo', value: 'ALL_TIME', icon: 'sym_o_history' },
  { label: 'Diario', value: 'DAILY', icon: 'sym_o_event_available' },
  { label: 'Semanal', value: 'WEEKLY', icon: 'sym_o_date_range' },
  { label: 'Mensual', value: 'MONTHLY', icon: 'sym_o_calendar_month' },
  { label: 'Trimestral', value: 'QUARTERLY', icon: 'sym_o_event_repeat' },
]

// Opciones de tipo de reporte a descargar (basado en tu backend)
const reportTypeOptions = [
  { label: 'Resumen de Alquileres', value: 'RENTAL_SUMMARY' },
  { label: 'Análisis de Ingresos', value: 'REVENUE_ANALYSIS' },
  { label: 'Actividad de Clientes', value: 'CUSTOMER_ACTIVITY' },
  { label: 'Vehículos Más Alquilados', value: 'MOST_RENTED_VEHICLES' },
]

// Computed para mostrar el rango de fechas en el input
const dateRangeDisplay = computed(() => {
  if (dateRange.value && dateRange.value.from && dateRange.value.to) {
    const from = formatDateFns(new Date(dateRange.value.from), 'dd/MM/yyyy')
    const to = formatDateFns(new Date(dateRange.value.to), 'dd/MM/yyyy')
    return `${from} - ${to}`
  }
  return ''
})

// Métodos para establecer rangos de fechas predefinidos
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

const setCurrentYear = () => {
  dateRange.value = {
    from: startOfYear(new Date()).toISOString().split('T')[0],
    to: endOfYear(new Date()).toISOString().split('T')[0],
  }
}

// Emitir filtros al componente padre
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
    reportType: reportTypeToDownload.value,
  })
}

// Observar cambios en el periodo para ajustar la selección de fechas
watch(period, (newPeriod) => {
  if (newPeriod === 'ALL_TIME') {
    dateRange.value = { from: null, to: null }
  } else {
    if (!dateRange.value.from || !dateRange.value.to) {
      setCurrentMonth()
    }
  }
})
</script>

<style scoped lang="scss">
.filter-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  color: #333;
}
</style>
