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
import { useQuasar } from 'quasar'

const $q = useQuasar()

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
  return (
    props.chartData &&
    Array.isArray(props.chartData.datasets) &&
    props.chartData.datasets.length > 0 &&
    props.chartData.datasets.some((ds) => Array.isArray(ds.data) && ds.data.length > 0)
  )
})

// Paleta de colores para gráficos
const CHART_COLORS = [
  '#42A5F5', // Azul claro
  '#66BB6A', // Verde
  '#FFA726', // Naranja
  '#EF5350', // Rojo
  '#AB47BC', // Púrpura
  '#78909C', // Gris azulado
  '#26A69A', // Teal
  '#FFCA28', // Ámbar
  '#5C6BC0', // Índigo
  '#EC407A', // Rosa
  '#7E57C2', // Violeta
  '#BDBDBD', // Gris
]

// Computed para opciones de ECharts
const chartOptions = computed(() => {
  const isMobile = $q.screen.lt.sm

  const commonOptions = {
    animation: true,
    animationDuration: 1200,
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 12,
      color: '#333',
    },
    grid: {
      left: isMobile ? '5%' : '3%',
      right: isMobile ? '5%' : '4%',
      bottom: isMobile ? '10%' : '3%',
      containLabel: true,
    },
    tooltip: {
      backgroundColor: 'rgba(50,50,50,0.8)',
      borderColor: '#333',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'shadow',
      },
    },
  }

  if (props.chartType === 'pie') {
    return {
      ...commonOptions,
      tooltip: {
        ...commonOptions.tooltip,
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        show: !isMobile, // Ocultar leyenda en móvil para más espacio
        orient: 'vertical',
        left: 'auto',
        right: '5%',
        top: 'center',
        textStyle: {
          fontSize: 12,
          color: '#555',
        },
        itemGap: 10,
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label,
        type: 'pie',
        radius: ['40%', '70%'],
        center: isMobile ? ['50%', '50%'] : ['40%', '50%'], // Centrar en móvil
        data: props.chartData.labels.map((label, i) => ({
          name: label,
          value: ds.data[i],
        })),
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
        label: {
          show: !isMobile, // Ocultar etiquetas en móvil
          position: 'outside',
          formatter: '{b}: {d}%',
          fontSize: 11,
          color: '#333',
          lineHeight: 16,
        },
        labelLine: {
          show: !isMobile,
        },
        itemStyle: {
          color: (params) => CHART_COLORS[params.dataIndex % CHART_COLORS.length],
          borderColor: '#fff',
          borderWidth: 1,
        },
      })),
    }
  }

  if (props.chartType === 'scatter') {
    return {
      ...commonOptions,
      grid: {
        ...commonOptions.grid,
        left: '10%', // Más espacio para etiquetas del eje Y
      },
      tooltip: {
        ...commonOptions.tooltip,
        trigger: 'item',
        formatter: (params) => {
          if (params.data && Array.isArray(params.data)) {
            return `**${params.name}**<br/>Alquileres: ${params.data[0]}<br/>Ingresos: $${params.data[1]}`
          }
          return params.name || ''
        },
      },
      xAxis: {
        type: 'value',
        name: isMobile ? 'Alquileres' : 'Cantidad de Alquileres',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: { fontSize: 10, color: '#666' },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#eee' } },
      },
      yAxis: {
        type: 'value',
        name: isMobile ? 'Ingresos' : 'Ingresos Generados',
        nameLocation: 'middle',
        nameGap: isMobile ? 35 : 50,
        axisLabel: { formatter: '$ {value}', fontSize: 10, color: '#666' },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label,
        type: 'scatter',
        data: ds.data,
        symbolSize: isMobile ? 8 : 12,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#5470C6',
            borderWidth: 2,
          },
        },
        itemStyle: {
          color: CHART_COLORS[2],
        },
        label: {
          show: !isMobile, // Ocultar etiquetas de puntos en móvil
          formatter: (params) => params.name,
          position: 'right',
          fontSize: 10,
          color: '#333',
        },
      })),
    }
  }

  const isHorizontalBar =
    props.chartType === 'bar' &&
    !isMobile &&
    props.chartData.labels &&
    props.chartData.labels.some((label) => label.length > 15)

  return {
    ...commonOptions,
    tooltip: { ...commonOptions.tooltip, trigger: 'axis' },
    legend: {
      show: !isMobile && props.chartData.datasets.length > 1,
      bottom: 0,
      textStyle: { fontSize: 12, color: '#555' },
    },
    xAxis: {
      type: isHorizontalBar ? 'value' : 'category',
      data: isHorizontalBar ? undefined : props.chartData.labels,
      axisLabel: {
        rotate: isMobile ? 45 : isHorizontalBar ? 0 : 30,
        interval: 0,
        fontSize: 10,
        color: '#666',
      },
      name: isHorizontalBar ? props.chartData.datasets[0]?.label || '' : '',
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    yAxis: {
      type: isHorizontalBar ? 'category' : 'value',
      data: isHorizontalBar ? props.chartData.labels : undefined,
      axisLabel: {
        formatter: (value) => {
          if (isMobile) return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
          if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
          return value
        },
        fontSize: 10,
        color: '#666',
      },
      name: isHorizontalBar ? '' : props.chartData.datasets[0]?.label || '',
      nameLocation: 'middle',
      nameGap: isHorizontalBar ? 80 : 40, // Más espacio para etiquetas largas en horizontal
      axisLine: { lineStyle: { color: '#ccc' } },
    },
    series: props.chartData.datasets.map((ds, index) => ({
      name: ds.label,
      type: props.chartType,
      data: ds.data,
      smooth: props.chartType === 'line',
      itemStyle: {
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
      barWidth: '60%',
      label: {
        show: !isMobile && props.chartType === 'bar',
        position: isHorizontalBar ? 'right' : 'top',
        valueAnimation: true,
        fontSize: 10,
        color: '#333',
      },
      lineStyle:
        props.chartType === 'line'
          ? {
              width: 3,
              type: 'solid',
            }
          : undefined,
      symbol: props.chartType === 'line' ? 'circle' : 'none',
      symbolSize: props.chartType === 'line' ? 8 : 0,
      showSymbol: props.chartType === 'line',
    })),
  }
})
</script>

<style scoped>
.dynamic-chart-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  color: #333;
}
.chart-container {
  width: 100%;
}
</style>