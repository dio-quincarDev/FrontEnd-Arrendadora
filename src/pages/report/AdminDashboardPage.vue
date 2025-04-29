<template>
  <q-page padding>
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-h4">Panel de Administración</div>
    </div>

    <MetricFilter @update-filters="handleFiltersUpdate" :loading="loading" />

    <!-- Loading general -->
    <q-inner-loading :showing="loading" label="Cargando métricas..." label-class="text-primary" />

    <div class="metrics-container q-mt-md">
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

    <!-- Sección de Reportes -->
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

      <!-- Descargas rápidas -->
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

    <!-- Visualización de Datos -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Visualización de Datos</div>
        <div class="row q-gutter-sm items-center">
          <q-radio v-model="chartDisplayMode" val="chart" label="Gráfico" />
          <q-radio v-model="chartDisplayMode" val="table" label="Tabla" />
          <q-space />
          <q-btn icon="refresh" round color="primary" @click="refreshData" :loading="refreshing" />
        </div>

        <!-- Gráfico -->
        <template v-if="chartDisplayMode === 'chart'">
          <RentalsTrendCard :trends="rentalTrends" :loading="chartLoading" class="q-mt-md" />
        </template>

        <!-- Tabla -->
        <template v-else>
          <q-table
            v-if="rentalTrends.length > 0"
            class="q-mt-md"
            :rows="rentalTrends"
            :columns="tableColumns"
            row-key="period"
            :loading="loading"
            flat
            bordered
          >
            <template v-slot:body-cell-value="props">
              <q-td :props="props">
                {{ Number(props.row.rentalCount).toLocaleString() }}
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

// Datos principales
const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({})
const newCustomers = ref(0)
const rentalTrends = ref([])

// Filtros
const period = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)

// Reportes
const reportFormat = ref('PDF')
const selectedReportType = ref('RENTAL_SUMMARY')
const chartDisplayMode = ref('chart')

// Configuraciones
const reportTypeOptions = [
  { label: 'Resumen de Rentas', value: 'RENTAL_SUMMARY' },
  { label: 'Reporte Financiero', value: 'FINANCIAL_REPORT' },
  { label: 'Reporte de Vehículos', value: 'VEHICLE_REPORT' },
  { label: 'Actividad de Clientes', value: 'CUSTOMER_ACTIVITY' },
]

const reportFormatOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'EXCEL' },
]

const tableColumns = [
  { name: 'period', label: 'Período', field: 'period', align: 'left' },
  { name: 'value', label: 'Alquileres', field: 'rentalCount', align: 'right' },
]

// Computed
const mostRentedVehicleLabel = computed(() => {
  if (!mostRentedVehicle.value.brand) return 'N/A'
  return `${mostRentedVehicle.value.brand} ${mostRentedVehicle.value.model} (${mostRentedVehicle.value.count || 0})`
})

// Métodos
async function loadData() {
  loading.value = true
  try {
    const params = buildQueryParams()

    const [rentals, revenue, vehicles, mostRented, customers, trends] = await Promise.all([
      ReportService.getTotalRentalsMetric(params),
      ReportService.getTotalRevenueMetric(params),
      ReportService.getUniqueVehiclesRentedMetric(params),
      ReportService.getMostRentedVehicleMetric(params),
      ReportService.getNewCustomersCountMetric(params),
      ReportService.getRentalTrendsMetric(params),
    ])

    totalRentals.value = rentals
    totalRevenue.value = parseFloat(revenue) || 0
    uniqueVehicles.value = vehicles
    mostRentedVehicle.value = mostRented
    newCustomers.value = customers
    rentalTrends.value = trends.map((t) => ({
      period: t.period,
      rentalCount: t.rentalCount || 0,
    }))
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
  const params = {
    period: period.value || 'MONTHLY',
    startDate: startDate.value ? formatDate(startDate.value) : null,
    endDate: endDate.value ? formatDate(endDate.value) : null,
  }
  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) {
      delete params[key]
    }
  })

  return params
}

function formatDate(dateString) {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function downloadFile(data, format, baseName) {
  const mimeType =
    format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  const extension = format === 'PDF' ? 'pdf' : 'xlsx'
  const filename = `${baseName}_${new Date().toISOString().slice(0, 10)}.${extension}`

  const blob = new Blob([data], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
