<template>
  <q-card class="trend-card">
    <q-card-section>
      <div class="chart-header">
        <div>
          <div class="text-h6">{{ title }}</div>
          <div class="debug-info text-caption text-grey">
            Datasets: {{ chartDataInternal?.datasets?.[0]?.data?.length || 'n/a' }} datos
          </div>
        </div>
        <div class="period-legend">{{ activePeriod }}</div>
      </div>
      <div class="chart-container">
        <div
          style="
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: white;
            padding: 5px;
            border: 1px solid red;
          "
        >
          Debug V-IF: Type: {{ currentChartType }} | Show: {{ showChart }} | Has Data:
          {{ !!chartDataInternal }} | Datasets: {{ chartDataInternal?.datasets?.length > 0 }}
        </div>

        <Bar
          v-if="
            currentChartType === 'bar' &&
            showChart &&
            chartDataInternal &&
            chartDataInternal.datasets &&
            chartDataInternal.datasets.length > 0
          "
          :key="chartRenderKey"
          :data="chartDataInternal"
          :options="barChartOptions"
          aria-label="Gráfico de barras dinámico"
          role="img"
        />

        <Line
          v-if="
            currentChartType === 'line' &&
            showChart &&
            chartDataInternal &&
            chartDataInternal.datasets &&
            chartDataInternal.datasets.length > 0
          "
          :key="chartRenderKey"
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
            scatterData.datasets.length > 0
          "
          :key="scatterRenderKey"
          :data="scatterData"
          :options="scatterChartOptions"
          aria-label="Gráfico de dispersión dinámico"
          role="img"
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

// Registro de componentes de Chart.js
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

// Definición de Props
const props = defineProps({
  title: String,
  endpoint: String,
  chartData: Object, // Para datos pasados directamente (ej. customerActivity)
  chartType: { type: String, default: 'bar' },
  activePeriod: String,
  startDate: String,
  endDate: String,
  format: String, // Aunque se ignora en backend para métricas, se mantiene por si se usa en otro lugar
  labelsKey: String, // Clave para las etiquetas del eje X
  valuesKey: String, // Clave para los valores del eje Y
  dataKeyX: String, // Clave para el eje X en scatter
  dataKeyY: String, // Clave para el eje Y en scatter
  labelFormatter: Function, // Función para formatear etiquetas
  noDataIcon: String, // Icono a mostrar si no hay datos
  barChartOptionsOverride: Object, // Opciones personalizadas para gráficos de barras
  lineChartOptionsOverride: Object, // Opciones personalizadas para gráficos de líneas
  scatterChartOptionsOverride: Object, // Opciones personalizadas para gráficos de dispersión
})

// Variables reactivas para los datos y estado del componente
const chartDataInternal = ref(null) // Datos formateados para gráficos de barra/línea
const scatterData = ref(null) // Datos formateados para gráficos de dispersión
const svgChart = ref('') // Para gráficos SVG (si aplica, no en este caso para métricas)
const loading = ref(false) // Estado de carga
const chartRenderKey = ref(0) // Clave para forzar re-render de gráficos de barra/línea
const scatterRenderKey = ref(0) // Clave para forzar re-render de gráficos de dispersión
const rawDebugData = ref(null) // Para depuración de datos crudos
const currentChartType = computed(() => props.chartType)
// ESTA ES LA LÍNEA CLAVE PARA LA DEPURACIÓN: FORZAR showChart a true
const showChart = ref(true) // ¡DEBUG! Forzado a true para ver si se muestra el gráfico.

// Función para formatear datos de la prop al formato de Chart.js
const formatChartDataFromProp = (data) => {
  console.log('[formatChartDataFromProp] START - Data recibida:', data)
  rawDebugData.value = data // Almacenar datos crudos para depuración
  if (!data) return null

  // Lógica para gráficos de Barra/Línea (si son arrays de objetos con labelsKey y valuesKey)
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    props.labelsKey &&
    props.valuesKey &&
    Object.prototype.hasOwnProperty.call(data[0], props.labelsKey) &&
    Object.prototype.hasOwnProperty.call(data[0], props.valuesKey)
  ) {
    // *** CAMBIO CLAVE AQUÍ: Asegurar al menos dos puntos de datos para Bar/Line ***
    const rawLabels = data.map((item) =>
      typeof props.labelFormatter === 'function'
        ? props.labelFormatter(item[props.labelsKey])
        : item[props.labelsKey],
    )
    const rawDataValues = data.map((item) => {
      const value = item[props.valuesKey]
      return typeof value === 'number' && value > 0 ? value : 0.001
    })

    return {
      labels: rawLabels.length === 1 ? [...rawLabels, ''] : rawLabels, // Añadir etiqueta vacía si solo hay un punto
      datasets: [
        {
          label: props.title,
          data: rawDataValues.length === 1 ? [...rawDataValues, 0] : rawDataValues, // Añadir un 0 si solo hay un punto
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderRadius: 4,
          borderSkipped: false,
          borderWidth: (ctx) => (ctx.dataset.data.length === 2 && ctx.dataIndex === 0 ? 8 : 2), // Esta es la definición final
        },
      ],
    }
  }

  // Lógica para gráficos Scatter (sin cambios, ya que funcionan bien con un solo punto)
  if (
    props.chartType === 'scatter' &&
    Array.isArray(data) &&
    data.length > 0 &&
    props.dataKeyX &&
    props.dataKeyY &&
    Object.prototype.hasOwnProperty.call(data[0], props.dataKeyX) &&
    Object.prototype.hasOwnProperty.call(data[0], props.dataKeyY)
  ) {
    return {
      datasets: [
        {
          label: props.title,
          data: data.map((item) => ({
            x: item[props.dataKeyX],
            y: item[props.dataKeyY],
          })),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          pointRadius: 5,
        },
      ],
    }
  }

  // Lógica para casos donde los datos son un objeto (mapa)
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
    // Si esta lógica se usa para Bar/Line y puede recibir un solo punto, también debería aplicarse aquí el fix de 2 puntos
    return {
      labels: Object.keys(data).length === 1 ? [...Object.keys(data), ''] : Object.keys(data),
      datasets: [
        {
          label: props.title,
          data:
            Object.values(data).length === 1 ? [...Object.values(data), 0] : Object.values(data),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderRadius: 4,
          borderSkipped: false,
          borderWidth: (ctx) => (ctx.dataset.data.length === 2 && ctx.dataIndex === 0 ? 8 : 2),
        },
      ],
    }
  }

  return null
}

const applyChartData = (data) => {
  console.log('[applyChartData] Called for', props.title, '. Raw data received:', data)
  rawDebugData.value = data

  if (!data || (Array.isArray(data) && data.length === 0)) {
    chartDataInternal.value = null
    scatterData.value = null
    svgChart.value = ''
    // showChart.value = false // COMENTADO para depuración
    chartRenderKey.value++
    scatterRenderKey.value++
    return
  }

  if (props.format === 'CHART_SVG') {
    svgChart.value = data
    chartDataInternal.value = null
    scatterData.value = null
    // showChart.value = false // COMENTADO para depuración
    return
  }

  if (props.chartType === 'scatter') {
    scatterData.value = formatChartDataFromProp(data)
    chartDataInternal.value = null
    svgChart.value = ''
    scatterRenderKey.value++
  } else {
    chartDataInternal.value = formatChartDataFromProp(data)
    scatterData.value = null
    svgChart.value = ''
    chartRenderKey.value++
  }

  console.log(
    '[applyChartData]',
    props.title,
    ': Handled as Bar/Line Chart.js. Final chartDataInternal.value:',
    chartDataInternal.value,
  )
  console.log(
    '[applyChartData]',
    props.title,
    ': Handled as Scatter Chart.js. Final scatterData.value:',
    scatterData.value,
  )

  // showChart.value = false // COMENTADO para depuración
  // nextTick(() => { // COMENTADO para depuración
  // showChart.value = true // COMENTADO para depuración
  // }) // COMENTADO para depuración
}

const fetchChartData = async () => {
  loading.value = true
  chartDataInternal.value = null
  scatterData.value = null
  svgChart.value = ''
  // showChart.value = false // COMENTADO para depuración

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

      let responseData = null
      switch (props.endpoint) {
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
          break
      }

      applyChartData(responseData)
    } catch (error) {
      console.error(`[fetchChartData] Error:`, error)
      // showChart.value = false // COMENTADO para depuración
    } finally {
      loading.value = false
    }
  }
}

watch(
  () => [
    props.chartData,
    props.endpoint,
    props.activePeriod,
    props.startDate,
    props.endDate,
    props.format,
  ],
  () => {
    if (props.endpoint || props.chartData) {
      fetchChartData()
    }
  },
  {
    immediate: true,
  },
)

// Opciones de configuración de gráficos computadas - ¡SIMPLIFICADAS AL MÁXIMO!
const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // Eliminadas todas las overrides para depuración
}))

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // Eliminadas todas las overrides para depuración
}))

const scatterChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: props.dataKeyX,
      },
      type: 'linear',
    },
    y: {
      title: {
        display: true,
        text: props.dataKeyY,
      },
      type: 'linear',
    },
  },
  ...props.scatterChartOptionsOverride, // Mantener para scatter ya que funciona
}))
</script>

<style scoped>
/* Estilos generales de la tarjeta */
.trend-card {
  border-radius: 12px;
  transition: box-shadow 0.3s ease;
}
.trend-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Encabezado del gráfico */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Contenedor del gráfico */
.chart-container {
  position: relative;
  height: 350px;
  min-height: 250px;
  width: 100%;
  /* Añadido para depuración: un borde y fondo para ver el área del canvas */
  border: 1px solid blue;
  background-color: lightgray;
}

/* Asegura que el canvas dentro del contenedor tome todo el ancho disponible */
.chart-container canvas {
  min-width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  /* Añadido para depuración: fondo para ver si se dibuja algo */
  background-color: lightblue;
}

/* Estilos para el overlay "Sin datos" */
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
