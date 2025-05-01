<template>
  <q-page padding>
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-h4">Panel de Administración</div>
    </div>

    <MetricFilter @update-filters="handleFiltersUpdate" :loading="loading" />

    <q-inner-loading :showing="loading" label="Cargando métricas..." label-class="text-primary" />

    <div class="metrics-container q-mt-md" aria-live="polite">
      <MetricCard
        title="Total de Alquileres"
        :value="totalRentals"
        icon="directions_car"
        :loading="loading"
      />
      <MetricCard
        title="Ingresos Totales"
        :value="totalRevenue"
        icon="attach_money"
        is-currency
        :loading="loading"
      />
      <MetricCard
        title="Vehículos Únicos"
        :value="uniqueVehicles"
        icon="car_rental"
        :loading="loading"
      />
      <MetricCard
        title="Vehículo Más Alquilado"
        :value="mostRentedVehicleLabel"
        icon="star"
        :loading="loading"
      />
      <MetricCard
        title="Nuevos Clientes"
        :value="newCustomers"
        icon="person_add"
        :loading="loading"
      />
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Generar Reporte</div>
      </q-card-section>
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedReportType"
            :options="reportTypeOptions"
            label="Tipo de Reporte"
            outlined
            emit-value
            map-options
            option-value="value"
            option-label="label"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="reportFormat"
            :options="reportFormatOptions"
            label="Formato"
            outlined
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-4 flex items-end">
          <q-btn
            color="primary"
            label="Generar Reporte"
            @click="generateCustomReport"
            :loading="downloading"
            icon="download"
            class="full-width"
          />
        </div>
      </q-card-section>

      <q-card-actions class="q-px-md q-pb-md">
        <q-btn
          color="secondary"
          label="Excel General"
          @click="downloadMetrics('EXCEL')"
          :loading="downloading"
          icon="download"
        />
        <q-btn
          color="accent"
          label="PDF General"
          @click="downloadMetrics('PDF')"
          :loading="downloading"
          icon="download"
          class="q-ml-sm"
        />
      </q-card-actions>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Visualización de Datos</div>
        <div class="row q-gutter-sm items-center">
          <q-radio v-model="chartDisplayMode" val="chart" label="Gráfico" />
          <q-radio v-model="chartDisplayMode" val="table" label="Tabla" />
          <q-space />
          <q-btn icon="refresh" round color="primary" @click="refreshData" :loading="refreshing" />
        </div>

        <template v-if="chartDisplayMode === 'chart'">
          <RentalsTrendCard
            v-if="rentalTrends.length"
            :trends="rentalTrends"
            :loading="chartLoading"
            class="q-mt-md"
          />
          <div v-else class="text-center q-pa-md text-grey">
            No hay datos disponibles para graficar
          </div>
        </template>

        <template v-else>
          <q-table
            v-if="rentalTrends.length"
            class="q-mt-md"
            :rows="rentalTrends"
            :columns="tableColumns"
            row-key="period"
            :pagination="{ rowsPerPage: 10 }"
            :loading="loading"
            flat
            bordered
          >
            <template v-slot:body-cell-rentalCount="props">
              <q-td :props="props">
                {{ props.row.rentalCount.toLocaleString() }}
              </q-td>
            </template>
          </q-table>
          <div v-else class="text-center q-pa-md text-grey">No hay datos para mostrar</div>
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import ReportService from 'src/services/report.service'
import MetricCard from 'src/components/report/MetricCard.vue'
import RentalsTrendCard from 'src/components/report/RentalsTrendCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'

const $q = useQuasar()
const router = useRouter()

// Estados reactivos
const loading = ref(false)
const downloading = ref(false)
const refreshing = ref(false)
const lastFetchParams = ref(null)

// Datos principales
const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({ brand: '', model: '', count: 0 })
const newCustomers = ref(0)
const rentalTrends = ref([])

// Filtros y configuración
const period = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)
const reportFormat = ref('PDF')
const selectedReportType = ref('RENTAL_SUMMARY')
const chartDisplayMode = ref('chart')

// Opciones de configuración
const reportTypeOptions = [
  { label: 'Resumen de Rentas', value: 'RENTAL_SUMMARY' },
  { label: 'Reporte Financiero', value: 'REVENUE_ANALYSIS' },
  { label: 'Reporte de Vehículos', value: 'VEHICLE_USAGE' },
  { label: 'Actividad de Clientes', value: 'CUSTOMER_ACTIVITY' },
  { label: 'Tendencia de Alquileres', value: 'RENTAL_TRENDS' },
]

const ALLOWED_PERIODS = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']

const reportFormatOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'EXCEL' },
]

const tableColumns = [
  { name: 'period', label: 'Período', field: 'period', align: 'left' },
  {
    name: 'rentalCount',
    label: 'Alquileres',
    field: 'rentalCount',
    align: 'right',
    format: (val) => val.toLocaleString(),
  },
]

// Computed
const mostRentedVehicleLabel = computed(() => {
  if (!mostRentedVehicle.value.brand) return 'N/A'
  return `${mostRentedVehicle.value.brand} ${mostRentedVehicle.value.model} (${mostRentedVehicle.value.count})`
})

// Métodos
async function loadData() {
  try {
    const currentParams = buildQueryParams()
    if (JSON.stringify(lastFetchParams.value) === JSON.stringify(currentParams)) return

    loading.value = true
    const [rentals, revenue, vehicles, mostRented, customers, trends] = await Promise.all([
      ReportService.getTotalRentalsMetric(currentParams),
      ReportService.getTotalRevenueMetric(currentParams),
      ReportService.getUniqueVehiclesRentedMetric(currentParams),
      ReportService.getMostRentedVehicleMetric(currentParams),
      ReportService.getNewCustomersCountMetric(currentParams),
      ReportService.getRentalTrendsMetric(currentParams),
    ])

    totalRentals.value = Number(rentals) || 0
    totalRevenue.value = Number(revenue) || 0
    uniqueVehicles.value = Number(vehicles) || 0
    newCustomers.value = Number(customers) || 0
    rentalTrends.value =
      trends.map((t) => ({
        period: t.period || 'Sin Periodo',
        rentalCount: Number(t.rentalCount) || 0,
      })) || []

    mostRentedVehicle.value = {
      brand: mostRented?.brand || 'N/A',
      model: mostRented?.model || '',
      count: Number(mostRented?.count) || 0,
    }

    lastFetchParams.value = currentParams
  } catch (error) {
    handleError(error, 'Error cargando datos')
  } finally {
    loading.value = false
  }
}

async function generateCustomReport() {
  downloading.value = true
  try {
    const params = {
      format: reportFormat.value,
      reportType: selectedReportType.value,
      ...buildQueryParams(),
    }

    const reportData = await ReportService.exportReport(params)
    downloadFile(reportData, params.format, `reporte_${selectedReportType.value}`)

    $q.notify({
      type: 'positive',
      message: 'Reporte generado correctamente',
      icon: 'check_circle',
    })
  } catch (error) {
    handleError(error, 'Error generando reporte')
  } finally {
    downloading.value = false
  }
}

async function downloadMetrics(format) {
  downloading.value = true
  try {
    const params = {
      format: format,
      reportType: 'GENERIC_METRICS',
      ...buildQueryParams(),
    }

    const reportData = await ReportService.exportReport(params)
    downloadFile(reportData, format, `metricas_generales`)

    $q.notify({
      type: 'positive',
      message: `Métricas descargadas en formato ${format}`,
      icon: 'download_done',
    })
  } catch (error) {
    handleError(error, `Error descargando ${format}`)
  } finally {
    downloading.value = false
  }
}

function buildQueryParams() {
  return Object.fromEntries(
    Object.entries({
      period: ALLOWED_PERIODS.includes(period.value) ? period.value : 'MONTHLY',
      startDate: formatDateISO(startDate.value),
      endDate: formatDateISO(endDate.value),
    }).filter(([, value]) => value !== null && value !== undefined), // Quitar coma sobrante aquí
  )
}

function downloadFile(blobData, format, baseName) {
  if (!(blobData instanceof Blob)) {
    handleError(new Error('Tipo de dato inválido para descarga'), 'Error en descarga')
    return
  }

  if (blobData.size === 0) {
    handleError(new Error('El archivo recibido está vacío'), 'Error en descarga')
    return
  }

  const extensionMap = {
    PDF: 'pdf',
    EXCEL: 'xlsx',
    CHART_PNG: 'png',
    CHART_SVG: 'svg',
  }

  const mimeTypes = {
    PDF: 'application/pdf',
    EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    CHART_PNG: 'image/png',
    CHART_SVG: 'image/svg+xml',
  }

  const extension = extensionMap[format] || 'bin'
  const mimeType = mimeTypes[format] || 'application/octet-stream'

  const blob = new Blob([blobData], { type: mimeType })
  const filename = `${baseName}_${new Date().toISOString().slice(0, 10)}.${extension}`
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function formatDateISO(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
}

function handleError(error, message) {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message,
    caption: error.response?.data?.message || error.message,
    position: 'top-right',
  })

  // Redirigir si es error de autenticación
  if (error.response?.status === 401) {
    router.push('/auth/login?redirect=/reports/dashboard')
  } else if (error.response?.status === 403) {
    router.push('/unauthorized')
  }
}

// Inicialización
onMounted(() => {
  console.log('AdminDashboardPage montado - Iniciando carga de datos')
  loadData()
})
</script>

<style scoped>
.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.chart-container {
  height: 400px;
  min-height: 300px;
}

.chart-content {
  width: 100%;
  max-width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  z-index: 1000;
}
</style>
