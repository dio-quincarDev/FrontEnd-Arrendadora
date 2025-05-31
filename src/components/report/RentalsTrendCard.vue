<template>
  <q-card class="trend-card">
    <q-card-section>
      <div class="chart-header">
        <div class="text-h6">{{ title }}</div>
        <div class="period-legend">{{ activePeriod }}</div>
      </div>

      <div class="chart-container">
        <Bar
          v-if="
            currentChartType === 'bar' &&
            chartDataInternal &&
            chartDataInternal.datasets &&
            chartDataInternal.datasets.length > 0 &&
            format === 'CHART_PNG'
          "
          :data="chartDataInternal"
          :options="barChartOptions"
          aria-label="Gráfico de barras dinámico"
          role="img"
        />
        <Line
          v-if="
            currentChartType === 'line' &&
            chartDataInternal &&
            chartDataInternal.datasets &&
            chartDataInternal.datasets.length > 0 &&
            format === 'CHART_PNG'
          "
          :data="chartDataInternal"
          :options="lineChartOptions"
          aria-label="Gráfico de líneas dinámico"
          role="img"
        />
        <Scatter
          v-if="
            currentChartType === 'scatter' &&
            scatterData &&
            scatterData.datasets &&
            scatterData.datasets.length > 0 &&
            format === 'CHART_PNG'
          "
          :data="scatterData"
          :options="scatterChartOptions"
          aria-label="Gráfico de dispersión dinámico"
          role="img"
        />
        <div
          v-else-if="format === 'CHART_SVG'"
          style="width: 100%; height: 100%"
          v-html="svgChart"
        />
        <div v-else class="no-data-overlay">
          <div class="no-data-content">
            <q-icon :name="noDataIcon" size="48px" color="grey-5" />
            <div class="text-subtitle1 text-grey-6 q-mt-md">
              {{ loading ? 'Cargando gráfico...' : 'Sin datos disponibles' }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Bar, Line, Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  ScatterController,
} from 'chart.js'
import ReportService from 'src/services/report.service'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  ScatterController,
)

const props = defineProps({
  title: String,
  endpoint: String,
  chartData: Object,
  chartType: {
    type: String,
    default: 'bar',
  },
  activePeriod: String,
  startDate: String,
  endDate: String,
  format: String,
  labelsKey: String,
  valuesKey: String,
  dataKeyX: String,
  dataKeyY: String,
  labelFormatter: Function,
  noDataIcon: String,
  barChartOptionsOverride: Object,
  lineChartOptionsOverride: Object,
  scatterChartOptionsOverride: Object,
})

const chartDataInternal = ref(null)
const scatterData = ref(null)
const svgChart = ref('')
const loading = ref(false)
const currentChartType = computed(() => props.chartType)

const formatChartDataFromProp = (data) => {
  if (!data) return null

  if (
    Array.isArray(data) &&
    data.length > 0 &&
    props.labelsKey in data[0] &&
    props.valuesKey in data[0]
  ) {
    return {
      labels: data.map((item) =>
        typeof props.labelFormatter === 'function'
          ? props.labelFormatter(item[props.labelsKey])
          : item[props.labelsKey],
      ),
      datasets: [
        {
          label: props.title,
          data: data.map((item) => item[props.valuesKey]),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  } else if (
    Array.isArray(data) &&
    data.length > 0 &&
    props.dataKeyX in data[0] &&
    props.dataKeyY in data[0]
  ) {
    return {
      datasets: [
        {
          label: props.title,
          data: data.map((item) => ({ x: item[props.dataKeyX], y: item[props.dataKeyY] })),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          pointRadius: 5,
        },
      ],
    }
  } else if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: props.title,
          data: Object.values(data),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  }
  return null
}

const applyChartData = (data) => {
  if (props.format === 'CHART_PNG') {
    if (props.chartType === 'scatter') {
      scatterData.value = formatChartDataFromProp(data)
    } else {
      chartDataInternal.value = formatChartDataFromProp(data)
    }
  } else if (props.format === 'CHART_SVG') {
    svgChart.value = data
  }
}

const fetchChartData = async () => {
  loading.value = true
  chartDataInternal.value = null
  scatterData.value = null
  svgChart.value = ''

  if (props.chartData) {
    applyChartData(props.chartData)
    loading.value = false
    return
  }

  if (props.endpoint) {
    try {
      const params = {
        period: props.activePeriod,
        startDate: props.startDate,
        endDate: props.endDate,
        format: props.format,
        chartType: props.chartType,
      }

      let responseData
      switch (props.endpoint) {
        case '/':
          responseData = await ReportService.getDashboardData(params)
          break
        case '/reports/metrics/rental-trends':
          responseData = await ReportService.getRentalTrendsMetric(params)
          break
        case '/reports/metrics/average-rental-duration':
          responseData = await ReportService.getAverageRentalDurationMetric(params)
          break
        case '/reports/metrics/top-customers':
          responseData = await ReportService.getTopCustomersMetric(params)
          break
        case '/reports/metrics/vehicle-usage':
          responseData = await ReportService.getVehicleUsageMetric(params)
          break
        default:
          console.error(`Endpoint desconocido: ${props.endpoint}`)
          loading.value = false
          return
      }

      applyChartData(responseData)
    } catch (error) {
      console.error(`Error fetching chart data for ${props.title} (${props.endpoint}):`, error)
    } finally {
      loading.value = false
    }
  } else {
    console.warn('No endpoint ni chartData proporcionados para el gráfico.')
    loading.value = false
  }
}

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  ...props.barChartOptionsOverride,
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  ...props.lineChartOptionsOverride,
}))

const scatterChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: props.dataKeyX }, type: 'linear' },
    y: { title: { display: true, text: props.dataKeyY }, type: 'linear' },
  },
  ...props.scatterChartOptionsOverride,
}))

watch(
  () => ({
    period: props.activePeriod,
    startDate: props.startDate,
    endDate: props.endDate,
    format: props.format,
    chartData: props.chartData,
  }),
  fetchChartData,
  { immediate: true, deep: true },
)
</script>

<style scoped>
.trend-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}

.trend-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-container {
  position: relative;
  height: 350px;
  min-height: 250px;
}

.no-data-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  border-radius: 8px;
}

.no-data-content {
  text-align: center;
  opacity: 0.7;
}
</style>
