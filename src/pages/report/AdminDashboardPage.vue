<template>
  <q-page padding>
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-h4">Panel de Administración</div>
    </div>

    <MetricFilter @update-filters="handleFiltersUpdate" :loading="loading" />

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
            :disable="downloading"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="reportFormat"
            :options="reportFormatOptions"
            label="Formato"
            outlined
            :disable="downloading"
          />
        </div>
        <div class="col-12 col-md-4 flex items-end">
          <q-btn
            color="primary"
            label="Generar Reporte Personalizado"
            @click="generateCustomReport"
            :loading="downloading"
            icon="download"
          />
        </div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <div class="text-subtitle1">Descarga Rápida de Métricas Generales</div>
        </div>
        <div class="col-6">
          <q-btn
            color="secondary"
            label="Descargar Métricas (Excel)"
            @click="downloadMetrics('EXCEL')"
            :loading="downloading"
            icon="download"
            full-width
          />
        </div>
        <div class="col-6">
          <q-btn
            color="accent"
            label="Descargar Métricas (PDF)"
            @click="downloadMetrics('PDF')"
            :loading="downloading"
            icon="download"
            full-width
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Visualización de Datos</div>
        <div class="row q-gutter-sm items-center">
          <q-radio v-model="chartDisplayMode" val="chart" label="Gráfico Interactivo" />
          <q-radio v-model="chartDisplayMode" val="table" label="Vista Tabular" />
          <q-space />
          <q-btn icon="refresh" round color="primary" @click="refreshData" :loading="refreshing" />
        </div>

        <template v-if="chartDisplayMode === 'chart'">
          <div class="row q-gutter-sm q-mt-md items-center">
            <q-select
              v-model="chartType"
              :options="chartTypeOptions"
              label="Tipo de Gráfico"
              dense
              outlined
              style="min-width: 200px"
            />
            <q-radio v-model="chartFormat" val="svg" label="SVG (Alta calidad)" />
            <q-radio v-model="chartFormat" val="png" label="PNG (Rápido)" />
          </div>

          <div v-if="chartLoading" class="q-mt-md flex flex-center">
            <q-spinner size="lg" />
            <span class="q-ml-sm">Cargando gráfico...</span>
          </div>

          <div v-else class="chart-container q-mt-md">
            <object
              v-if="chartFormat === 'svg' && svgContent"
              :data="svgDataUrl"
              type="image/svg+xml"
              class="chart-content"
              style="height: 400px"
            />
            <img
              v-else-if="chartFormat === 'png' && pngUrl"
              :src="pngUrl"
              class="chart-content"
              style="height: 400px; object-fit: contain"
              alt="Gráfico de métricas"
            />
            <div v-else class="text-center q-pa-md text-grey">
              No hay datos disponibles para mostrar el gráfico
            </div>
          </div>
        </template>

        <template v-else>
          <q-table
            v-if="tableData.length > 0"
            class="q-mt-md"
            :rows="tableData"
            :columns="tableColumns"
            row-key="id"
            dense
            flat
            bordered
          />
          <div v-else class="text-center q-pa-md text-grey">
            No hay datos disponibles para mostrar en tabla
          </div>
        </template>
      </q-card-section>
    </q-card>

    <RentalsTrendCard :trends="rentalTrends" class="q-mt-md" :loading="loading" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { API_CONSTANTS } from 'src/boot/axios'
import ReportService from 'src/services/report.service'
import MetricCard from 'src/components/report/MetricCard.vue'
import RentalsTrendCard from 'src/components/report/RentalsTrendCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'

const $q = useQuasar()
const router = useRouter()

// Estado del componente
const loading = ref(false)
const downloading = ref(false)
const chartLoading = ref(false)
const refreshing = ref(false)

// Datos principales
const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({})
const newCustomers = ref(0)
const rentalTrends = ref([])
const tableData = ref([])

// Filtros
const period = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)

// Reportes
const reportFormat = ref('PDF')
const selectedReportType = ref('RENTAL_SUMMARY')
const chartDisplayMode = ref('chart')
const chartType = ref('bar')
const chartFormat = ref('svg')
const svgContent = ref(null)
const pngUrl = ref(null)

// Opciones de configuración
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

const chartTypeOptions = [
  { label: 'Barras', value: 'bar' },
  { label: 'Líneas', value: 'line' },
  { label: 'Tarta', value: 'pie' },
  { label: 'Área', value: 'area' },
]

const tableColumns = [
  { name: 'period', label: 'Período', field: 'period', align: 'left' },
  { name: 'value', label: 'Valor', field: 'value', align: 'right' },
]

// Computed
const svgDataUrl = computed(() =>
  svgContent.value ? `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.value)}` : null,
)

// Eliminamos formattedRevenue que no se usa
// y usamos directamente la lógica de formateo en el componente MetricCard

const mostRentedVehicleLabel = computed(() => {
  if (!mostRentedVehicle.value.brand) return 'N/A'
  return `${mostRentedVehicle.value.brand} ${mostRentedVehicle.value.model} (${mostRentedVehicle.value.rentalCount || 0})`
})

// Métodos
function handleFiltersUpdate(filters) {
  startDate.value = filters.startDate
  endDate.value = filters.endDate
  period.value = filters.period?.value || filters.period
  loadData()
}

watch(
  () => totalRevenue.value,
  (newValue, oldValue) => {
    console.log(`totalRevenue.value changed from ${oldValue} to ${newValue}`)
    console.log(`Type of newValue: ${typeof newValue}`)
    if (isNaN(newValue)) {
      console.warn('totalRevenue.value is becoming NaN!')
    }
  },
)

async function loadData() {
  loading.value = true
  try {
    const params = buildQueryParams()

    const [rentals, revenue, vehicles, mostRented, customers, trends, table] = await Promise.all([
      ReportService.getTotalRentalsMetric(params),
      ReportService.getTotalRevenueMetric(params),
      ReportService.getUniqueVehiclesRentedMetric(params),
      ReportService.getMostRentedVehicleMetric(params),
      ReportService.getNewCustomersCountMetric(params),
      ReportService.getRentalTrendsMetric(params),
      ReportService.getTableData(params),
    ])

    totalRentals.value = rentals

    //  *** Ajuste para manejar la respuesta de revenue  ***
    console.log('getTotalRevenueMetric response (raw):', revenue)
    console.log('Type of revenue:', typeof revenue)

    if (typeof revenue === 'string') {
      // Si viene como string, limpiamos cualquier símbolo de moneda y espacios
      const numericValue = parseFloat(revenue.replace(/[$\s,]/g, ''))
      console.log('Parsed revenue:', numericValue)
      totalRevenue.value = isNaN(numericValue) ? 0 : numericValue
    } else if (typeof revenue === 'number') {
      totalRevenue.value = revenue
    } else {
      console.warn('Unexpected revenue type, setting to 0:', revenue)
      totalRevenue.value = 0
    }
    //  *** Fin del ajuste  ***

    uniqueVehicles.value = vehicles
    mostRentedVehicle.value = mostRented
    newCustomers.value = customers
    rentalTrends.value = trends
    tableData.value = table

    if (chartDisplayMode.value === 'chart') {
      await loadChart()
    }
  } catch (error) {
    handleError(error, 'Error cargando datos')
  } finally {
    loading.value = false
  }
}

async function refreshData() {
  refreshing.value = true
  try {
    await loadData()
    $q.notify({
      type: 'positive',
      message: 'Datos actualizados correctamente',
    })
  } catch (error) {
    handleError(error, 'Error actualizando datos')
  } finally {
    refreshing.value = false
  }
}

async function generateCustomReport() {
  downloading.value = true
  try {
    const reportData = await ReportService.exportReport({
      format: reportFormat.value,
      reportType: selectedReportType.value,
      ...buildQueryParams(),
    })
    downloadFile(
      reportData,
      reportFormat.value,
      `reporte_${selectedReportType.value.toLowerCase()}`,
    )
    $q.notify({
      type: 'positive',
      message: 'Reporte generado correctamente',
    })
  } catch (error) {
    handleError(error, 'Error generando reporte')
  } finally {
    downloading.value = false
  }
}

async function loadChart() {
  chartLoading.value = true
  try {
    const params = {
      ...buildQueryParams(),
      format: chartFormat.value === 'svg' ? 'CHART_SVG' : 'CHART_PNG',
      reportType: selectedReportType.value,
      chartType: chartType.value,
    }

    if (chartFormat.value === 'svg') {
      const response = await ReportService.exportReport(params)
      if (typeof response === 'string' && response.includes('<svg')) {
        svgContent.value = response
      } else {
        throw new Error('Formato SVG inválido recibido del servidor')
      }
    } else {
      pngUrl.value = `${API_CONSTANTS.REPORTS_ROUTE}/export?${new URLSearchParams(params)}&t=${Date.now()}`
    }
  } catch (error) {
    handleError(error, 'Error cargando gráfico')
    // Fallback a PNG si SVG falla
    if (chartFormat.value === 'svg') {
      chartFormat.value = 'png'
      await loadChart()
    }
  } finally {
    chartLoading.value = false
  }
}

async function downloadMetrics(format) {
  downloading.value = true
  try {
    const params = ReportService.buildMetricsExportParams(
      format,
      period.value,
      startDate.value,
      endDate.value,
    )
    const reportData = await ReportService.exportReport(params)
    downloadFile(reportData, format, `metricas_generales_${format.toLowerCase()}`)
    $q.notify({
      type: 'positive',
      message: `Métricas descargadas correctamente en formato ${format}`,
    })
  } catch (error) {
    handleError(error, `Error al descargar métricas en formato ${format}`)
  } finally {
    downloading.value = false
  }
}

function buildQueryParams() {
  const params = {
    period: period.value || 'MONTHLY',
    chartType: chartType.value || 'bar',
  }

  if (startDate.value) {
    params.startDate = formatDate(startDate.value)
  }
  if (endDate.value) {
    params.endDate = formatDate(endDate.value)
  }

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
  min-height: 400px;
  max-height: 480px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
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
