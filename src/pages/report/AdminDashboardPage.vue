<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <!-- Filtros -->
      <div class="col-12">
        <metric-filter @update-filters="handleUpdateFilters" :loading="loading" />
      </div>

      <!-- Título de Métricas -->
      <div class="col-12 q-mt-md">
        <div class="text-h5 text-primary q-mb-sm">Métricas Clave</div>
      </div>

      <!-- Métricas Clave -->
      <div class="col-12">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Total de Alquileres"
              icon="sym_o_receipt_long"
              :value="dashboardData.totalRentals"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Ingresos Totales"
              icon="sym_o_payments"
              :value="dashboardData.totalRevenue"
              :isCurrency="true"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Vehículos Disponibles"
              icon="sym_o_local_parking"
              :value="dashboardData.availableVehicles"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Clientes Activos"
              icon="sym_o_group"
              :value="dashboardData.activeCustomers"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Nuevos Clientes"
              icon="sym_o_person_add"
              :value="dashboardData.newCustomers"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Clientes Únicos"
              icon="sym_o_diversity_3"
              :value="dashboardData.uniqueCustomers"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card
              title="Duración Promedio Alquiler (días)"
              icon="sym_o_hourglass_top"
              :value="dashboardData.averageRentalDuration"
              :loading="loading"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <metric-card title="Vehículo Más Alquilado" icon="sym_o_directions_car" :loading="loading">
              <template v-if="!loading">
                <div v-if="dashboardData.mostRentedVehicle?.brand">
                  <div class="text-h5 q-mb-xs">
                    {{ dashboardData.mostRentedVehicle.brand }}
                    {{ dashboardData.mostRentedVehicle.model }}
                  </div>
                  <div class="text-caption">
                    Alquileres: {{ dashboardData.mostRentedVehicle.rentalCount }}
                  </div>
                </div>
                <div v-else class="text-h5">0</div>
              </template>
            </metric-card>
          </div>
        </div>
      </div>

      <!-- Título de Análisis Visual -->
      <div class="col-12 q-mt-xl">
        <div class="text-h5 text-primary q-mb-sm">Análisis Visual</div>
      </div>

      <!-- Gráficos -->
      <div class="col-12">
        <div class="row q-col-gutter-lg">
          <!-- Gráfico Principal Ancho -->
          <div class="col-12">
            <dynamic-chart-card
              title="Tendencias de Alquiler"
              chartType="line"
              :chartData="formatRentalTrendsChartData(dashboardData.rentalTrends)"
              :loading="loading"
              noDataIcon="sym_o_trending_up"
            />
          </div>

          <!-- Gráficos Secundarios -->
          <div class="col-12 col-lg-6">
            <dynamic-chart-card
              title="Top Clientes por Alquileres"
              chartType="bar"
              :chartData="formatTopCustomersChartData(dashboardData.topCustomersByRentals)"
              :loading="loading"
              noDataIcon="sym_o_person"
            />
          </div>
          <div class="col-12 col-lg-6">
            <dynamic-chart-card
              title="Uso de Vehículos"
              chartType="pie"
              :chartData="formatVehicleUsageChartData(dashboardData.vehicleUsage)"
              :loading="loading"
              noDataIcon="sym_o_car_rental"
            />
          </div>
          <div class="col-12 col-lg-6">
            <dynamic-chart-card
              title="Actividad de Clientes (Alquileres vs. Ingresos)"
              chartType="scatter"
              :chartData="formatCustomerActivityChartData(dashboardData.customerActivity)"
              :loading="loading"
              noDataIcon="sym_o_groups"
            />
          </div>
          <div class="col-12 col-lg-6">
            <dynamic-chart-card
              title="Duración Promedio por Cliente"
              chartType="bar"
              :chartData="
                formatAverageRentalDurationChartData(
                  dashboardData.averageRentalDurationByTopCustomers,
                )
              "
              :loading="loading"
              noDataIcon="sym_o_hourglass_empty"
            />
          </div>
        </div>
      </div>

      <!-- Botón de Descarga -->
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
import MetricCard from 'src/components/report/MetricCard.vue'
import DynamicChartCard from 'src/components/report/DynamicChartCard.vue'
import MetricFilter from 'src/components/report/MetricFilter.vue'

const { dashboardData, loading, downloading, loadDashboardData, downloadReport } =
  useDashboardData()

const currentFilters = ref({
  period: 'ALL_TIME',
  startDate: null,
  endDate: null,
  reportType: 'RENTAL_SUMMARY',
})

// --- Funciones de Normalización de Datos para Gráficos ---
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

// --- Manejadores de Eventos ---
const handleUpdateFilters = (filters) => {
  currentFilters.value = filters
  loadDashboardData(currentFilters.value)
}

const handleDownloadReport = () => {
  downloadReport({
    format: 'PDF',
    ...currentFilters.value,
  })
}

// --- Ciclo de Vida ---
onMounted(() => {
  loadDashboardData(currentFilters.value)
})
</script>

<style lang="scss" scoped>
.text-primary {
  color: $accent !important;
}
</style>