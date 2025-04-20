// NUEVA VERSION MEJORADA - AdminDashboardPage.vue
<template>
  <q-page padding>
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-h4">Panel de Administración</div>
      <div>
        <q-btn
          color="primary"
          icon="picture_as_pdf"
          label="Exportar Métricas (PDF)"
          @click="exportMetrics('PDF')"
          class="q-mr-sm"
        />
        <q-btn
          color="secondary"
          icon="grid_on"
          label="Exportar Métricas (Excel)"
          @click="exportMetrics('EXCEL')"
        />
      </div>
    </div>

    <!-- Filtros -->
    <MetricFilter @update-filters="updateFilters" :loading="loading" />

    <!-- Métricas -->
    <div class="metrics-container q-mt-md">
      <MetricCard title="Total de Alquileres" :value="totalRentals" icon="directions_car" />
      <MetricCard
        title="Ingresos Totales"
        :value="formattedRevenue"
        icon="attach_money"
        is-currency
      />
      <MetricCard title="Vehículos Únicos" :value="uniqueVehicles" icon="car_rental" />
      <MetricCard title="Vehículo Más Alquilado" :value="mostRentedVehicleLabel" icon="star" />
      <MetricCard title="Nuevos Clientes" :value="newCustomers" icon="person_add" />
    </div>

    <!-- Reporte PDF / Excel por tipo -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Generar Reporte Personalizado</div>
      </q-card-section>
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedReportType"
            :options="reportTypeOptions"
            label="Tipo de Reporte"
            outlined
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="reportFormat"
            :options="reportFormatOptions"
            label="Formato"
            outlined
          />
        </div>
        <div class="col-12 col-md-4 flex items-end">
          <q-btn
            color="primary"
            label="Descargar Reporte"
            @click="downloadReport"
            :loading="downloading"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Gráfico de Tendencias -->
    <RentalsTrendCard :trends="rentalTrends" class="q-mt-md" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ReportService from 'src/services/report.service'
import MetricCard from 'src/components/report/MetricCard.vue'
import RentalsTrendCard from 'src/components/report/RentalsTrendCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'

const $q = useQuasar()

const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({})
const newCustomers = ref(0)
const rentalTrends = ref([])

const reportFormat = ref('PDF')
const selectedReportType = ref('RENTAL_SUMMARY')
const downloading = ref(false)
const loading = ref(false)

const period = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)

const reportTypeOptions = [
  { label: 'Resumen de Rentas', value: 'RENTAL_SUMMARY' },
  { label: 'Reporte Financiero', value: 'FINANCIAL_REPORT' },
  { label: 'Reporte de Vehículos', value: 'VEHICLE_REPORT' },
]

const reportFormatOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'EXCEL' },
]

const formattedRevenue = computed(() => totalRevenue.value)
const mostRentedVehicleLabel = computed(() => {
  if (!mostRentedVehicle.value.brand) return 'N/A'
  return `${mostRentedVehicle.value.brand} ${mostRentedVehicle.value.model} (${mostRentedVehicle.value.rentalCount})`
})

function updateFilters(filters) {
  startDate.value = filters.startDate
  endDate.value = filters.endDate
  period.value = filters.period?.value || filters.period
  fetchMetrics()
}

async function fetchMetrics() {
  loading.value = true
  try {
    const params = {
      startDate: formatDate(startDate.value),
      endDate: formatDate(endDate.value),
      period: period.value,
    }
    const [rentals, revenue, vehicles, mostRented, customers, trends] = await Promise.all([
      ReportService.getTotalRentals(params),
      ReportService.getTotalRevenue(params),
      ReportService.getUniqueVehiclesRented(params),
      ReportService.getMostRentedVehicle(params),
      ReportService.getNewCustomersCount(params),
      ReportService.getRentalTrends(params),
    ])

    totalRentals.value = rentals
    totalRevenue.value = revenue
    uniqueVehicles.value = vehicles
    mostRentedVehicle.value = mostRented
    newCustomers.value = customers
    rentalTrends.value = trends.map((t) => ({ period: t.period, rentalCount: t.rentalCount }))
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar métricas', caption: err.message })
  } finally {
    loading.value = false
  }
}

async function downloadReport() {
  downloading.value = true
  try {
    const reportData = await ReportService.exportReport({
      format: reportFormat.value,
      reportType: selectedReportType.value,
      period: period.value,
      startDate: formatDate(startDate.value),
      endDate: formatDate(endDate.value),
    })
    downloadFile(reportData, reportFormat.value)
    $q.notify({ type: 'positive', message: 'Reporte generado con éxito' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al generar reporte', caption: err.message })
  } finally {
    downloading.value = false
  }
}

async function exportMetrics(format) {
  try {
    const headers = ['Métrica', 'Valor']
    const data = [
      ['Total de Alquileres', totalRentals.value],
      ['Ingresos Totales', formattedRevenue.value],
      ['Vehículos Únicos', uniqueVehicles.value],
      ['Vehículo Más Alquilado', mostRentedVehicleLabel.value],
      ['Nuevos Clientes', newCustomers.value],
    ]

    const blob = await ReportService.exportGenericTable({ headers, data, format })
    downloadFile(blob, format)
    $q.notify({ type: 'positive', message: 'Métricas exportadas con éxito' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error exportando métricas', caption: err.message })
  }
}

function downloadFile(data, format) {
  const mimeType =
    format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const extension = format === 'PDF' ? 'pdf' : 'xlsx'
  const filename = `metricas_${new Date().toISOString().slice(0, 10)}.${extension}`
  const blob = new Blob([data], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toISOString().split('T')[0]
}

onMounted(fetchMetrics)
</script>

<style scoped>
.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
</style>
