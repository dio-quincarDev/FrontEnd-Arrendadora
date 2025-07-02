<template>
  <q-card class="dynamic-chart-card q-pa-md">
    <div class="text-h6 q-mb-md text-primary">{{ title }}</div>
    <div v-if="loading" class="flex flex-center" style="height: 250px">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="!hasData" class="flex flex-center column" style="height: 250px">
      <q-icon :name="noDataIcon" size="48px" color="grey-6" />
      <div class="text-grey-7 q-mt-sm text-subtitle1">No hay datos para mostrar</div>
    </div>

    <v-chart
      v-else
      :option="chartOptions"
      autoresize
      class="chart-container"
      style="height: 300px"
    />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  title: { type: String, required: true },
  chartType: { type: String, default: 'bar' }, // bar, line, pie, scatter
  chartData: { type: Object, default: () => ({ labels: [], datasets: [] }) },
  loading: { type: Boolean, default: false },
  noDataIcon: { type: String, default: 'bar_chart' },
})

// Computed para determinar si hay data
const hasData = computed(() => {
  // Verifica si chartData existe, si tiene datasets y si al menos un dataset tiene datos.
  return (
    props.chartData &&
    Array.isArray(props.chartData.datasets) &&
    props.chartData.datasets.length > 0 &&
    props.chartData.datasets.some((ds) => Array.isArray(ds.data) && ds.data.length > 0)
  )
})

// Paleta de colores para gráficos
const CHART_COLORS = [
  '#5470C6',
  '#91CC75',
  '#EE6666',
  '#FC8452',
  '#9A60B4',
  '#EA7CCC', // Colores primarios y cálidos
  '#73C0DE',
  '#3BA272',
  '#FCBF49',
  '#F79256',
  '#D4ADFF',
  '#F9E7D2', // Tonos secundarios y pasteles
]

// Computed para opciones de ECharts
const chartOptions = computed(() => {
  const commonOptions = {
    animation: true,
    animationDuration: 1200, // Animación un poco más larga para suavidad
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 12,
      color: '#333', // Color general de texto para legibilidad
    },
    // Ajuste de margen para todos los gráficos
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true, // Asegura que las etiquetas de los ejes no se corten
    },
    tooltip: {
      // Estilo de tooltip global
      backgroundColor: 'rgba(50,50,50,0.8)',
      borderColor: '#333',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'shadow', // Por defecto para barras/líneas
      },
    },
  }

  if (props.chartType === 'pie') {
    return {
      ...commonOptions,
      tooltip: {
        ...commonOptions.tooltip, // Hereda el estilo base del tooltip
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)', // Nombre de serie, nombre de dato, valor, porcentaje
      },
      legend: {
        orient: 'vertical',
        left: 'auto',
        right: '5%', // Mover la leyenda a la derecha para un gráfico más centrado
        top: 'center', // Centrar verticalmente
        padding: [20, 0, 20, 0], // Espaciado
        textStyle: {
          fontSize: 12, // Tamaño de fuente para la leyenda
          color: '#555',
        },
        itemGap: 10, // Espacio entre elementos de la leyenda
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label,
        type: 'pie',
        radius: ['40%', '70%'], // Anillo para un diseño más moderno
        center: ['40%', '50%'], // Ajuste del centro para hacer espacio a la leyenda
        data: props.chartData.labels.map((label, i) => ({
          name: label,
          value: ds.data[i],
        })),
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
        label: {
          show: true,
          position: 'outside', // Etiquetas fuera del anillo
          formatter: '{b}: {d}%', // Muestra nombre del dato y porcentaje
          fontSize: 11, // Tamaño de fuente para etiquetas del pastel
          color: '#333',
          lineHeight: 16, // Altura de línea para evitar superposición
        },
        labelLine: {
          show: true,
          length: 10, // Largo de la primera parte de la línea
          length2: 15, // Largo de la segunda parte de la línea
          smooth: true, // Líneas suaves
        },
        itemStyle: {
          color: (params) => CHART_COLORS[params.dataIndex % CHART_COLORS.length], // Usa la paleta de colores
          borderColor: '#fff', // Borde blanco entre segmentos
          borderWidth: 1,
        },
      })),
    }
  }

  if (props.chartType === 'scatter') {
    return {
      ...commonOptions,
      tooltip: {
        ...commonOptions.tooltip,
        trigger: 'item',
        formatter: (params) => {
          if (params.data && Array.isArray(params.data)) {
            // Asume que data[0] es alquileres y data[1] es ingresos, y params.name es el nombre del cliente
            return `**${params.name}**<br/>Alquileres: ${params.data[0]}<br/>Ingresos: $${params.data[1]}`
          }
          return params.name || ''
        },
      },
      xAxis: {
        type: 'value',
        name: 'Cantidad de Alquileres',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: '{value}',
          fontSize: 11,
          color: '#666',
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#eee' } },
      },
      yAxis: {
        type: 'value',
        name: 'Ingresos Generados',
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          formatter: '$ {value}',
          fontSize: 11,
          color: '#666',
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label, // Por ejemplo, 'Actividad de Cliente'
        type: 'scatter',
        data: ds.data,
        symbolSize: 12, // Tamaño de los puntos
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#5470C6', // Borde de resaltado
            borderWidth: 2,
          },
        },
        itemStyle: {
          color: CHART_COLORS[2], // Color distintivo para los puntos (ej: un rojo suave)
        },
        label: {
          show: true, // Muestra el nombre del cliente junto al punto
          formatter: (params) => params.name,
          position: 'right',
          fontSize: 10,
          color: '#333',
        },
      })),
    }
  }

  // Por defecto: bar y line charts
  // Determinamos si es un gráfico de barras horizontal para nombres largos
  const isHorizontalBar =
    props.chartType === 'bar' &&
    props.chartData.labels &&
    props.chartData.labels.some((label) => label.length > 15) // Si alguna etiqueta es muy larga

  return {
    ...commonOptions,
    tooltip: { ...commonOptions.tooltip, trigger: 'axis' }, // Tooltip de eje para bar/line
    legend: {
      show: props.chartData.datasets.length > 1,
      bottom: 0,
      textStyle: { fontSize: 12, color: '#555' },
    },
    xAxis: {
      type: isHorizontalBar ? 'value' : 'category',
      data: isHorizontalBar ? undefined : props.chartData.labels, // Data en Y para horizontal
      axisLabel: {
        rotate: isHorizontalBar
          ? 0
          : props.chartData.labels && props.chartData.labels.length > 5
            ? 30
            : 0,
        interval: 0, // Asegura que todas las etiquetas se muestren
        fontSize: 11,
        color: '#666',
      },
      name: isHorizontalBar ? props.chartData.datasets[0]?.label || '' : '', // Nombre del eje X (si es horizontal, la etiqueta de la serie)
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    yAxis: {
      type: isHorizontalBar ? 'category' : 'value',
      data: isHorizontalBar ? props.chartData.labels : undefined, // Data en X para vertical
      axisLabel: {
        formatter: (value) => {
          // Formateo para números grandes (K para miles, M para millones)
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
          if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
          return value
        },
        fontSize: 11,
        color: '#666',
      },
      name: isHorizontalBar ? '' : props.chartData.datasets[0]?.label || '', // Nombre del eje Y (si es vertical, la etiqueta de la serie)
      nameLocation: 'middle',
      nameGap: 35,
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    series: props.chartData.datasets.map((ds, index) => ({
      name: ds.label,
      type: props.chartType,
      data: ds.data,
      smooth: props.chartType === 'line', // Curvas suaves para líneas
      itemStyle: {
        color: CHART_COLORS[index % CHART_COLORS.length], // Usa la paleta de colores, rotando
      },
      barWidth: '60%', // Ancho de las barras
      label: {
        // Etiquetas directas en las barras
        show: props.chartType === 'bar', // Mostrar solo en barras
        position: isHorizontalBar ? 'right' : 'top', // Posición de la etiqueta
        valueAnimation: true, // Animación al cambiar el valor
        fontSize: 10,
        color: '#333',
      },
      // Configuración de línea específica si es type 'line'
      lineStyle:
        props.chartType === 'line'
          ? {
              width: 3, // Grosor de la línea
              type: 'solid',
            }
          : undefined,
      // Marcadores en la línea para gráficos de línea
      symbol: props.chartType === 'line' ? 'circle' : 'none',
      symbolSize: props.chartType === 'line' ? 8 : 0,
      showSymbol: props.chartType === 'line', // Mostrar marcadores por defecto
    })),
  }
})
</script>

<style scoped>
.dynamic-chart-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra más pronunciada */
  background: linear-gradient(145deg, #ffffff, #f0f0f0); /* Degradado suave */
  color: #333; /* Color de texto base */
}
.chart-container {
  width: 100%;
}
</style>
