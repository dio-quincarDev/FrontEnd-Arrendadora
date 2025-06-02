<!-- src/pages/AdminDashboardPage.vue -->
<template>
  <q-page class="admin-dashboard q-pa-lg">
    <div class="dashboard-header q-mb-xl">
      <div class="text-h4 text-primary q-mb-md">Dashboard Analítico</div>
      <metric-filter @update-filters="handleFiltersUpdate" :loading="loading" />
    </div>

    <div class="metrics-grid q-mb-xl">
      <metric-card
        title="Alquileres Activos"
        icon="directions_car"
        color="primary"
        :value="dashboardData.totalRentals"
        :loading="loading"
      />
      <metric-card
        title="Ingresos Totales"
        icon="paid"
        color="positive"
        :value="dashboardData.totalRevenue"
        :isCurrency="true"
        :loading="loading"
      />
      <metric-card
        title="Vehículos Disponibles"
        icon="car_rental"
        color="info"
        :value="dashboardData.availableVehicles"
        :loading="loading"
      />
      <metric-card
        title="Clientes Activos"
        icon="people"
        color="warning"
        :value="dashboardData.activeCustomers"
        :loading="loading"
      />
      <metric-card
        title="Duración Promedio (General)"
        icon="timer"
        color="accent"
        :value="formatDuration(dashboardData.averageRentalDuration)"
        :loading="loading"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-6">
        <rentals-trend-card
          title="Duración Promedio de Alquiler por Cliente"
          endpoint="/reports/metrics/average-rental-duration"
          chartType="bar"
          :activePeriod="activePeriod"
          :startDate="startDate"
          :endDate="endDate"
          :format="chartFormat"
          labelsKey="customer"
          valuesKey="averageDuration"
          noDataIcon="hourglass_empty"
          :barChartOptionsOverride="{ indexAxis: 'y' }"
        />
      </div>
      <div class="col-6">
        <rentals-trend-card
          title="Clientes Frecuentes en Alquileres"
          :chartData="dashboardData.topCustomersByRentals"
          chartType="bar"
          :activePeriod="activePeriod"
          :startDate="startDate"
          :endDate="endDate"
          :format="chartFormat"
          labelsKey="name"
          valuesKey="rentalCount"
          noDataIcon="people"
        />
      </div>
      <div class="col-12">
        <rentals-trend-card
          title="Actividad de Clientes"
          :chartData="dashboardData.customerActivity"
          chartType="scatter"
          :activePeriod="activePeriod"
          :startDate="startDate"
          :endDate="endDate"
          :format="chartFormat"
          dataKeyX="rentals"
          dataKeyY="revenue"
          noDataIcon="scatter_plot"
        />
      </div>
      <div class="col-6">
        <rentals-trend-card
          title="Uso de Vehículos"
          :chartData="formatVehicleUsageForChart(dashboardData.vehicleUsage)"
          chartType="bar"
          :activePeriod="activePeriod"
          :startDate="startDate"
          :endDate="endDate"
          :format="chartFormat"
          labelsKey="brandModel"
          valuesKey="usageCount"
          noDataIcon="directions_car"
        />
      </div>
      <div class="col-6">
        <rentals-trend-card
          title="Tendencias de Alquileres"
          :endpoint="'/reports/metrics/rental-trends'"
          chartType="line"
          :activePeriod="activePeriod"
          :startDate="startDate"
          :endDate="endDate"
          :format="chartFormat"
          labelsKey="period"
          valuesKey="rentalCount"
          :labelFormatter="formatPeriodLabel"
          noDataIcon="trending_up"
        />
      </div>
    </div>

    <q-card class="reports-section q-mt-xl">
      <q-card-section>
        <div class="text-h6 q-mb-md">Generación de Reportes</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedReportType"
              :options="reportTypeOptions"
              label="Tipo de Reporte"
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  color="primary"
                  label="Descargar PDF"
                  @click="downloadReport('PDF')"
                  :loading="downloading"
                  icon="picture_as_pdf"
                  class="full-width"
                />
              </div>
              <div class="col-6">
                <q-btn
                  color="positive"
                  label="Descargar Excel"
                  @click="downloadReport('EXCEL')"
                  :loading="downloading"
                  icon="table_chart"
                  class="full-width"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MetricCard from 'src/components/report/MetricCard.vue'
import RentalsTrendCard from 'src/components/report/RentalsTrendCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'
import ReportService from 'src/services/report.service'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const downloading = ref(false)
const activePeriod = ref('ALL_TIME') // Cambio aplicado aquí
const startDate = ref(null) // ← Limpiamos el default para ALL_TIME
const endDate = ref(null)
const chartFormat = ref('CHART_PNG')

const dashboardData = ref({
  totalRentals: 0,
  totalRevenue: 0,
  uniqueVehicles: 0,
  activeCustomers: 0,
  newCustomers: 0,
  averageRentalDuration: 0,
  topCustomersByRentals: [],
  vehicleUsage: [],
  customerActivity: [],
  rentalTrends: [],
  mostRentedVehicle: {},
})

const selectedReportType = ref('RENTAL_SUMMARY')

const reportTypeOptions = [
  { label: 'Resumen de Alquileres', value: 'RENTAL_SUMMARY' },
  { label: 'Análisis de Ingresos', value: 'REVENUE_ANALYSIS' },
  { label: 'Actividad de Clientes', value: 'CUSTOMER_ACTIVITY' },
  { label: 'Vehículos Más Alquilados', value: 'MOST_RENTED_VEHICLES' },
]

const handleFiltersUpdate = async (filters) => {
  activePeriod.value = filters.period
  startDate.value = filters.startDate
  endDate.value = filters.endDate
  chartFormat.value = filters.format
  await loadDashboardData(filters)
}
const loadDashboardData = async (params = {}) => {
  const resolvedParams = {
    period: params.period || activePeriod.value,
    startDate: params.startDate || startDate.value,
    endDate: params.endDate || endDate.value,
  }

  loading.value = true
  try {
    const response = await ReportService.getDashboardData(resolvedParams)
    if (response && typeof response === 'object') {
      dashboardData.value = {
        totalRentals: response?.totalRentals ?? 0,
        totalRevenue: response?.totalRevenue ?? 0,
        uniqueVehicles: response?.uniqueVehicles ?? 0,
        availableVehicles: response?.availableVehicles ?? 0,
        activeCustomers: response?.activeCustomers ?? 0,
        newCustomers: response?.newCustomers ?? 0,
        averageRentalDuration: response?.averageRentalDuration ?? 0,
        topCustomersByRentals: response?.topCustomersByRentals ?? [],
        vehicleUsage: response?.vehicleUsage ?? [],
        customerActivity: response?.customerActivity ?? [],
        rentalTrends: response?.rentalTrends ?? [],
        mostRentedVehicle: response?.mostRentedVehicle ?? {},
      }
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar el dashboard', caption: error.message })
  } finally {
    loading.value = false
  }
}

const downloadReport = async (format) => {
  downloading.value = true
  try {
    const response = await ReportService.exportReport({
      format,
      reportType: selectedReportType.value,
      period: activePeriod.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
    ReportService.downloadFile(response, format, selectedReportType.value.toLowerCase())
    $q.notify({ type: 'positive', message: 'Reporte descargado exitosamente' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al generar el reporte', caption: error.message })
  } finally {
    downloading.value = false
  }
}

const formatPeriodLabel = (period) => {
  const [year, month] = period.split('-')
  return new Date(`${year}-${month}-01`).toLocaleDateString('es-MX', {
    month: 'short',
    year: 'numeric',
  })
}

const formatDuration = (duration) => {
  const days = Math.floor(duration)
  return `${days} días`
}

const formatVehicleUsageForChart = (usage) => {
  return Array.isArray(usage)
    ? usage.map((v) => ({ brandModel: v.vehicle, usageCount: v.count }))
    : []
}

onMounted(() => {
  loadDashboardData({
    period: activePeriod.value,
    startDate: startDate.value,
    endDate: endDate.value,
  })
})
</script>
