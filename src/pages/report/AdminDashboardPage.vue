<template>
  <q-page padding>
    <h1 class="text-h4 q-mb-md">Panel de Administración</h1>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="period"
              :options="periodOptions"
              label="Período"
              outlined
              @update:model-value="handlePeriodChange"
            />
          </div>

          <div v-if="showCustomDates" class="col-12 col-md-4">
            <q-input v-model="startDate" label="Fecha de inicio" type="date" outlined />
          </div>

          <div v-if="showCustomDates" class="col-12 col-md-4">
            <q-input v-model="endDate" label="Fecha de fin" type="date" outlined />
          </div>

          <div class="col-12">
            <q-btn
              color="primary"
              label="Aplicar Filtros"
              @click="fetchMetrics"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Métricas -->
    <div class="metrics-container q-mb-md">
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

    <!-- Generador de Reportes -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Generar Reporte</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="reportFormat"
              :options="reportFormatOptions"
              label="Formato"
              outlined
            />
          </div>

          <div class="col-12 col-md-6">
            <q-btn
              color="primary"
              label="Descargar Reporte"
              @click="downloadReport"
              :loading="downloading"
            />
          </div>
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

const $q = useQuasar()

// Estado
const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({})
const newCustomers = ref(0)
const rentalTrends = ref([])
const loading = ref(false)
const downloading = ref(false)

// Filtros
const period = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)
const reportFormat = ref('PDF')

// Opciones
const periodOptions = [
  { label: 'Últimos 7 días', value: 'WEEKLY' },
  { label: 'Último mes', value: 'MONTHLY' },
  { label: 'Último trimestre', value: 'QUARTERLY' },
  { label: 'Último año', value: 'YEARLY' },
  { label: 'Personalizado', value: 'CUSTOM' },
]

const reportFormatOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'EXCEL' },
]

// Computed
const showCustomDates = computed(() => period.value === 'CUSTOM')
const formattedRevenue = computed(() => totalRevenue.value)
const mostRentedVehicleLabel = computed(() => {
  if (!mostRentedVehicle.value.brand) return 'N/A'
  return `${mostRentedVehicle.value.brand} ${mostRentedVehicle.value.model} (${mostRentedVehicle.value.rentalCount})`
})

// Métodos
async function fetchMetrics() {
  loading.value = true
  try {
    const params = {
      startDate: showCustomDates.value ? formatDate(startDate.value) : null,
      endDate: showCustomDates.value ? formatDate(endDate.value) : null,
    }

    const [rentals, revenue, vehicles, mostRented, customers, trends] = await Promise.all([
      ReportService.getTotalRentals(params),
      ReportService.getTotalRevenue(params),
      ReportService.getUniqueVehiclesRented(params),
      ReportService.getMostRentedVehicle(params),
      ReportService.getNewCustomersCount(params),
      ReportService.getRentalTrends({
        period: period.value,
        ...params,
      }),
    ])

    totalRentals.value = rentals
    totalRevenue.value = revenue
    uniqueVehicles.value = vehicles
    mostRentedVehicle.value = mostRented.brand ? mostRented : {}
    newCustomers.value = customers
    rentalTrends.value = trends.map((t) => ({
      date: t.period,
      count: t.rentalCount,
    }))
  } catch (err) {
    console.error('Error fetching metrics:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las métricas',
      caption: err.response?.data?.message || err.message,
    })
  } finally {
    loading.value = false
  }
}

function handlePeriodChange() {
  if (period.value !== 'CUSTOM') {
    startDate.value = null
    endDate.value = null
  }
}

async function downloadReport() {
  downloading.value = true
  try {
    const params = {
      format: reportFormat.value,
      reportType: 'RENTAL_SUMMARY',
      period: period.value,
      startDate: showCustomDates.value ? formatDate(startDate.value) : null,
      endDate: showCustomDates.value ? formatDate(endDate.value) : null,
    }

    const reportData = await ReportService.exportReport(params)
    downloadFile(reportData, reportFormat.value)

    $q.notify({
      type: 'positive',
      message: 'Reporte generado con éxito',
    })
  } catch (err) {
    console.error('Error downloading report:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
      caption: err.response?.data?.message || err.message,
    })
  } finally {
    downloading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toISOString().split('T')[0]
}

function downloadFile(data, format) {
  const mimeType =
    format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  const extension = format === 'PDF' ? 'pdf' : 'xlsx'
  const filename = `reporte_${new Date().toISOString().slice(0, 10)}.${extension}`

  const blob = new Blob([data], { type: mimeType })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Inicialización
onMounted(fetchMetrics)
</script>

<style scoped>
.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

@media (max-width: 600px) {
  .metrics-container {
    grid-template-columns: 1fr;
  }
}
</style>
