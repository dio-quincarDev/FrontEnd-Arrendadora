<template>
  <q-card class="filter-card q-pa-md">
    <q-card-section class="q-pb-sm">
      <div class="text-h6 text-primary">Filtros de Dashboard</div>
    </q-card-section>

    <q-card-section class="q-pt-sm">
      <div class="row q-col-gutter-md items-start">
        <!-- Período -->
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
            class="filter-input"
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

        <!-- Rango de Fechas -->
        <div class="col-12 col-md-4 col-lg-4">
          <q-input
            filled
            dense
            v-model="dateRangeDisplay"
            label="Rango de Fechas"
            color="primary"
            readonly
            :disable="period === 'ALL_TIME'"
            class="filter-input"
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

        <!-- Tipo de Reporte -->
        <div class="col-12 col-md-4 col-lg-5">
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
            class="filter-input"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, defineEmits, watch, computed } from 'vue'
// import { useQuasar } from 'quasar' // No longer needed
import {
  endOfMonth,
  startOfMonth,
  subDays,
  startOfYear,
  endOfYear,
  format as formatDateFns,
  startOfQuarter,
  endOfQuarter,
  subMonths,
} from 'date-fns'

// const $q = useQuasar() // No longer needed for notifications
const emit = defineEmits(['update-filters'])

// Props are received but not directly used in the script, so no need to assign to a variable.
defineProps({
  loading: { type: Boolean, default: false },
})

// --- DEBOUNCE UTILITY ---
// Utility para retrasar la ejecución de una función, evitando llamadas excesivas a la API
let debounceTimer
const debounce = (func, delay = 500) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => func(), delay)
}

// --- CONSTANTS ---
// Valores de período alineados con el Enum del Backend para evitar inconsistencias.
const TIME_PERIODS = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUAL: 'BIANNUAL',
  ANNUAL: 'ANNUAL',
  ALL_TIME: 'ALL_TIME',
}

// --- REACTIVE STATE ---
const dateRange = ref({
  from: startOfMonth(new Date()).toISOString().split('T')[0],
  to: endOfMonth(new Date()).toISOString().split('T')[0],
})
const period = ref(TIME_PERIODS.ALL_TIME)
const reportTypeToDownload = ref('RENTAL_SUMMARY')

// --- OPTIONS ---
const periodOptions = [
  { label: 'Todo el Tiempo', value: TIME_PERIODS.ALL_TIME, icon: 'sym_o_history' },
  { label: 'Mensual', value: TIME_PERIODS.MONTHLY, icon: 'sym_o_calendar_month' },
  { label: 'Trimestral', value: TIME_PERIODS.QUARTERLY, icon: 'sym_o_event_repeat' },
  { label: 'Semestral', value: TIME_PERIODS.BIANNUAL, icon: 'sym_o_calendar_view_day' },
  { label: 'Anual', value: TIME_PERIODS.ANNUAL, icon: 'sym_o_event' },
]

const reportTypeOptions = [
  { label: 'Resumen de Alquileres', value: 'RENTAL_SUMMARY' },
  { label: 'Análisis de Ingresos', value: 'REVENUE_ANALYSIS' },
  { label: 'Actividad de Clientes', value: 'CUSTOMER_ACTIVITY' },
  { label: 'Vehículos Más Alquilados', value: 'MOST_RENTED_VEHICLES' },
  { label: 'Ingresos por Nivel de Precios', value: 'REVENUE_BY_PRICING_TIER' },
  { label: 'Alquileres por Tipo de Vehículo', value: 'RENTALS_BY_VEHICLE_TYPE' },
]

// --- COMPUTED ---
const dateRangeDisplay = computed(() => {
  if (period.value === TIME_PERIODS.ALL_TIME) return 'Todo el historial'
  if (dateRange.value && dateRange.value.from && dateRange.value.to) {
    const from = formatDateFns(new Date(dateRange.value.from), 'dd/MM/yyyy')
    const to = formatDateFns(new Date(dateRange.value.to), 'dd/MM/yyyy')
    return `${from} - ${to}`
  }
  return 'Seleccione un rango'
})

// --- METHODS ---
const formatDateForApi = (date) => date.toISOString().split('T')[0]

const setRelativeDateRange = (days) => {
  const end = new Date()
  const start = subDays(end, days)
  dateRange.value = { from: formatDateForApi(start), to: formatDateForApi(end) }
}

const setCurrentMonth = () => {
  const now = new Date()
  dateRange.value = {
    from: formatDateForApi(startOfMonth(now)),
    to: formatDateForApi(endOfMonth(now)),
  }
}

const setCurrentQuarter = () => {
  const now = new Date()
  dateRange.value = {
    from: formatDateForApi(startOfQuarter(now)),
    to: formatDateForApi(endOfQuarter(now)),
  }
}

const setLastSixMonths = () => {
  const end = new Date()
  const start = subMonths(end, 6)
  dateRange.value = { from: formatDateForApi(start), to: formatDateForApi(end) }
}

const setCurrentYear = () => {
  const now = new Date()
  dateRange.value = {
    from: formatDateForApi(startOfYear(now)),
    to: formatDateForApi(endOfYear(now)),
  }
}

const emitFilters = () => {
  let from = null
  let to = null

  if (period.value !== TIME_PERIODS.ALL_TIME) {
    from = dateRange.value.from
    to = dateRange.value.to

    if (!from || !to) {
      // No notificar, simplemente no emitir si el rango no es válido
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

// --- WATCHERS ---
// Observar cambios en el periodo para ajustar la selección de fechas de forma inteligente.
watch(period, (newPeriod) => {
  switch (newPeriod) {
    case TIME_PERIODS.ALL_TIME:
      dateRange.value = { from: null, to: null }
      break
    case TIME_PERIODS.MONTHLY:
      setCurrentMonth()
      break
    case TIME_PERIODS.QUARTERLY:
      setCurrentQuarter()
      break
    case TIME_PERIODS.BIANNUAL:
      setLastSixMonths()
      break
    case TIME_PERIODS.ANNUAL:
      setCurrentYear()
      break
    default:
      // Si el periodo no coincide con ninguno, o es la primera vez, se establece el mes actual.
      if (!dateRange.value.from || !dateRange.value.to) {
        setCurrentMonth()
      }
      break
  }
})

// Observador central que reacciona a cualquier cambio en los filtros y emite con debounce
watch(
  [dateRange, reportTypeToDownload],
  () => {
    debounce(emitFilters)
  },
  { deep: true }, // 'deep' es importante para que el watcher reaccione a cambios en el objeto dateRange
)
</script>

<style scoped lang="scss">
.filter-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  color: #333;
}

/*
  Mejora de la visibilidad de las etiquetas de los filtros.
  Se usa ::v-deep para asegurar que los estilos se apliquen a los componentes de Quasar.
*/
:deep(.filter-input .q-field__label) {
  color: #2c2c2c !important; // Usa el color $dark para alto contraste
  font-weight: 500; // Un poco más de peso para legibilidad
}

/* Estilo para el input deshabilitado */
:deep(.q-field--disabled) {
  opacity: 0.6 !important; // Opacidad reducida para indicar que está inactivo
  background-color: #f5f5f5; // Fondo ligeramente gris
  cursor: not-allowed; // Mejora la UX indicando que el campo no es interactivo
}
</style>