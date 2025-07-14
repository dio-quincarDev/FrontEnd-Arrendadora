<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <metric-filter @update-filters="handleUpdateFilters" :loading="loading" />
      </div>

      <div class="col-12 q-mt-md">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-3">
            <metric-card
              title="Total de Alquileres"
              icon="sym_o_receipt_long"
              color="blue-grey-10"
              :value="dashboardData.totalRentals"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Ingresos Totales"
              icon="sym_o_payments"
              color="green-10"
              :value="dashboardData.totalRevenue"
              :isCurrency="true"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Vehículos Disponibles"
              icon="sym_o_local_parking"
              color="dark"
              :value="dashboardData.availableVehicles"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Clientes Activos"
              icon="sym_o_group"
              color="grey-10"
              :value="dashboardData.activeCustomers"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Nuevos Clientes"
              icon="sym_o_person_add"
              color="brown-10"
              :value="dashboardData.newCustomers"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Clientes Únicos"
              icon="sym_o_diversity_3"
              color="deep-purple-10"
              :value="dashboardData.uniqueCustomers"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Duración Promedio Alquiler (días)"
              icon="sym_o_hourglass_top"
              color="blue-grey-10"
              :value="dashboardData.averageRentalDuration"
              :loading="loading"
            />
          </div>

          <div class="col-12 col-md-3">
            <metric-card
              title="Vehículo Más Alquilado"
              icon="sym_o_directions_car"
              color="red-10"
              :loading="loading"
            >
              <template v-if="!loading">
                <div v-if="dashboardData.mostRentedVehicle?.brand">
                  <div class="text-h5 text-white q-mb-xs">
                    {{ dashboardData.mostRentedVehicle.brand }}
                    {{ dashboardData.mostRentedVehicle.model }}
                  </div>
                  <div class="text-caption text-white-7">
                    Alquileres: {{ dashboardData.mostRentedVehicle.rentalCount }}
                  </div>
                </div>
                <div v-else class="text-h5 text-white-7 q-mb-xs">No disponible</div>
              </template>
            </metric-card>
          </div>
        </div>
      </div>

      <div class="col-12 q-mt-xl">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <dynamic-chart-card
              title="Top Clientes por Alquileres"
              chartType="bar"
              :chartData="formatTopCustomersChartData(dashboardData.topCustomersByRentals)"
              :loading="loading"
              noDataIcon="person"
            />
          </div>

          <div class="col-12 col-md-6">
            <dynamic-chart-card
              title="Uso de Vehículos"
              chartType="pie"
              :chartData="formatVehicleUsageChartData(dashboardData.vehicleUsage)"
              :loading="loading"
              noDataIcon="car_rental"
            />
          </div>

          <div class="col-12 col-md-6">
            <dynamic-chart-card
              title="Actividad de Clientes (Alquileres vs. Ingresos)"
              chartType="scatter"
              :chartData="formatCustomerActivityChartData(dashboardData.customerActivity)"
              :loading="loading"
              noDataIcon="groups"
            />
          </div>

          <div class="col-12 col-md-6">
            <dynamic-chart-card
              title="Tendencias de Alquiler"
              chartType="line"
              :chartData="formatRentalTrendsChartData(dashboardData.rentalTrends)"
              :loading="loading"
              noDataIcon="trending_up"
            />
          </div>

          <div class="col-12 col-md-6">
            <dynamic-chart-card
              title="Duración Promedio por Cliente"
              chartType="bar"
              :chartData="
                formatAverageRentalDurationChartData(
                  dashboardData.averageRentalDurationByTopCustomers,
                )
              "
              :loading="loading"
              noDataIcon="hourglass_empty"
            />
          </div>
        </div>
      </div>

      <div class="col-12 q-mt-lg text-center">
        <q-btn
          label="Descargar Reporte"
          icon="sym_o_download"
          color="secondary"
          @click="handleDownloadReport"
          :loading="downloading"
          outline
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import useDashboardData from 'src/composables/useDashboardData'
import MetricCard from 'src/components/report/MetricCard.vue' // Asegúrate de que esta ruta sea correcta
import DynamicChartCard from 'src/components/report/DynamicChartCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'

// Extrae las propiedades reactivas del composable
const { dashboardData, loading, downloading, loadDashboardData, downloadReport } =
  useDashboardData()

// Define un ref para los filtros actuales que se pasarán a loadDashboardData
// Incluye 'reportType' con un valor por defecto para la descarga de reportes
const currentFilters = ref({
  period: 'ALL_TIME',
  startDate: null,
  endDate: null,
  reportType: 'RENTAL_SUMMARY',
})

// Funciones de normalización para los gráficos
const formatTopCustomersChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return { labels: [], datasets: [] }
  return {
    labels: data.map((c) => c.name),
    datasets: [{ label: 'Alquileres', data: data.map((c) => c.rentalCount) }],
  }
}

const formatVehicleUsageChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return { labels: [], datasets: [] }
  return {
    labels: data.map((d) => d.vehicle),
    datasets: [{ label: 'Uso', data: data.map((d) => d.count) }],
  }
}

const formatCustomerActivityChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return { labels: [], datasets: [] }
  return {
    labels: data.map((c) => c.name),
    datasets: [{ label: 'Actividad de Cliente', data: data.map((c) => [c.rentals, c.revenue]) }],
  }
}

const formatRentalTrendsChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return { labels: [], datasets: [] }
  const labels = data.map((t) => {
    if (t.period && typeof t.period === 'string' && t.period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = t.period.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    }
    return t.period
  })
  return {
    labels: labels,
    datasets: [{ label: 'Alquileres', data: data.map((t) => t.rentalCount) }],
  }
}

const formatAverageRentalDurationChartData = (data) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return { labels: [], datasets: [] }
  }
  const labels = Object.keys(data)
  const values = Object.values(data)
  return {
    labels: labels,
    datasets: [{ label: 'Duración Promedio (días)', data: values }],
  }
}

// Manejador del evento 'update-filters' emitido por MetricFilter
const handleUpdateFilters = (filters) => {
  // Cuando se actualizan los filtros, también actualiza el reportType
  currentFilters.value = { ...filters, reportType: filters.reportType || 'RENTAL_SUMMARY' }
  loadDashboardData(currentFilters.value)
}

// Manejador para la descarga de reportes
const handleDownloadReport = () => {
  downloadReport({
    format: 'PDF', // El formato es fijo a PDF por ahora, según lo que tu backend soporta
    reportType: currentFilters.value.reportType, // Usa el tipo de reporte seleccionado en el filtro
    ...currentFilters.value, // Pasa también las fechas y el periodo
  })
}

// Carga los datos del dashboard cuando el componente se monta inicialmente
onMounted(() => {
  loadDashboardData(currentFilters.value)
})
</script>

<style lang="scss" scoped>
// No hay estilos específicos aquí, ya que la mayoría se manejan en los componentes individuales.
// Puedes agregar estilos globales si los necesitas para el padding de la página, etc.
</style>
