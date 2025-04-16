<template>
  <q-page padding>
    <h1>Panel de Administración</h1>
    <div class="metrics-container">
      <MetricCard>
        <template #value>{{ totalRentals }}</template>
        <template #label>Total de Alquileres</template>
      </MetricCard>

      <MetricCard>
        <template #value>${{ totalRevenue }}</template>
        <template #label>Ingresos Totales</template>
      </MetricCard>

      <MetricCard>
        <template #value>{{ uniqueVehicles }}</template>
        <template #label>Vehículos Únicos Alquilados</template>
      </MetricCard>

      <MetricCard>
        <template #value
          >{{ mostRentedVehicle.brand }} {{ mostRentedVehicle.model }} ({{
            mostRentedVehicle.rentalCount
          }})</template
        >
        <template #label>Vehículo Más Alquilado</template>
      </MetricCard>

      <MetricCard>
        <template #value>{{ newCustomers }}</template>
        <template #label>Nuevos Clientes</template>
      </MetricCard>

      <RentalTrendsCard :trends="rentalTrends" />
    </div>

    <MetricsFilter
      :loading="loading"
      @update-metrics="fetchMetrics"
      @update-filters="updateFilters"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ReportService from 'src/services/report.service'
import MetricCard from 'src/components/admin-dashboard/MetricCard.vue'
import RentalTrendsCard from 'src/components/admin-dashboard/RentalTrendsCard.vue'
import MetricsFilter from 'src/components/admin-dashboard/MetricsFilter.vue'

const totalRentals = ref(0)
const totalRevenue = ref(0)
const uniqueVehicles = ref(0)
const mostRentedVehicle = ref({})
const newCustomers = ref(0)
const rentalTrends = ref([])
const startDate = ref(null)
const endDate = ref(null)
const period = ref('MONTHLY')
const loading = ref(false)

async function fetchMetrics() {
  loading.value = true
  const params = {
    startDate: startDate.value,
    endDate: endDate.value,
    period: period.value,
  }
  try {
    totalRentals.value = await ReportService.getTotalRentals(params)
    totalRevenue.value = await ReportService.getTotalRevenue(params)
    uniqueVehicles.value = await ReportService.getUniqueVehiclesRented(params)
    mostRentedVehicle.value = (await ReportService.getMostRentedVehicle(params)) || {}
    newCustomers.value = await ReportService.getNewCustomersCount(params)
    rentalTrends.value = (await ReportService.getRentalTrends(params)) || []
  } catch (error) {
    console.error('Error al obtener las métricas:', error)
  } finally {
    loading.value = false
  }
}

function updateFilters(filters) {
  startDate.value = filters.startDate
  endDate.value = filters.endDate
  period.value = filters.period
}

onMounted(fetchMetrics)
</script>

<style scoped>
.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
</style>
