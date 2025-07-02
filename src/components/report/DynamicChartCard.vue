<template>
  <q-card class="dynamic-chart-card q-pa-md">
    <div class="text-h6 q-mb-md">{{ title }}</div>

    <div v-if="loading" class="flex flex-center" style="height: 250px">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="!hasData" class="flex flex-center column" style="height: 250px">
      <q-icon :name="noDataIcon" size="48px" color="grey" />
      <div class="text-grey q-mt-sm">No hay datos para mostrar</div>
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
// No necesitamos importar y usar ECharts aquí si ya lo haces en un boot file.
// import VChart from 'vue-echarts'
// import { use } from 'echarts/core'
// ... y demás importaciones de ECharts (renderers, charts, components)
// use([...])

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
  // Mejora: también considera el caso donde `datasets` existe pero está vacío o sus `data` arrays están vacíos
  return (
    props.chartData &&
    Array.isArray(props.chartData.datasets) &&
    props.chartData.datasets.length > 0 &&
    props.chartData.datasets.some((ds) => Array.isArray(ds.data) && ds.data.length > 0)
  )
})

// Computed para options de ECharts
const chartOptions = computed(() => {
  // Opciones comunes para todos los tipos de gráficos (título puede ser redundante si ya lo tienes arriba)
  const commonOptions = {
    // Si quieres un título dentro del gráfico, descomenta y ajusta:
    // title: { text: props.title, left: 'center', textStyle: { fontSize: 16 } },
    animation: true, // Habilitar animaciones por defecto
    animationDuration: 1000,
  }

  if (props.chartType === 'pie') {
    return {
      ...commonOptions,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)', // {a} series name, {b} data name, {c} data value, {d} percentage
      },
      legend: {
        orient: 'vertical', // o 'horizontal'
        left: 'left', // o 'center', 'right'
        top: 'middle', // o 'top', 'bottom'
        // Esto ayudará a que la leyenda no se superponga
        // Si hay muchos elementos, podrías considerar 'bottom' y 'horizontal'
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label,
        type: 'pie',
        radius: '50%', // Tamaño del círculo del pie
        center: ['50%', '50%'], // Posición del centro del pie
        data: props.chartData.labels.map((label, i) => ({
          name: label,
          value: ds.data[i],
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      })),
    }
  }

  if (props.chartType === 'scatter') {
    return {
      ...commonOptions,
      tooltip: {
        trigger: 'item',
        // Formato personalizado para el tooltip de scatter, asumiendo [x, y]
        formatter: (params) => {
          if (params.data && Array.isArray(params.data)) {
            // Asume que el primer valor es 'rentals' y el segundo 'revenue'
            return `${params.seriesName}:<br/>Alquileres: ${params.data[0]}<br/>Ingresos: ${params.data[1]}`
          }
          return params.name || '' // Fallback si la data no es como se espera
        },
      },
      xAxis: {
        type: 'value', // Eje de valor para scatter
        name: 'Cantidad de Alquileres', // Etiqueta para el eje X
        nameLocation: 'middle', // Posición de la etiqueta del eje
        nameGap: 25, // Espacio entre etiqueta y eje
        axisLabel: {
          formatter: '{value}', // Puedes añadir un sufijo si es necesario, ej. '{value} alquileres'
        },
      },
      yAxis: {
        type: 'value', // Eje de valor para scatter
        name: 'Ingresos Generados', // Etiqueta para el eje Y
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          formatter: '$ {value}', // Formato para moneda
        },
      },
      series: props.chartData.datasets.map((ds) => ({
        name: ds.label,
        type: 'scatter',
        data: ds.data,
        symbolSize: 10, // Tamaño de los puntos
        emphasis: {
          focus: 'series', // Resaltar solo la serie actual
        },
        // Puedes añadir un color por defecto o paleta de colores aquí
        itemStyle: {
          color: '#EE6666', // Un color de ejemplo para scatter
        },
      })),
    }
  }

  // bar / line
  return {
    ...commonOptions,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, // Tooltip de eje para bar/line
    legend: { show: props.chartData.datasets.length > 1 ? true : false, bottom: 0 }, // Mostrar leyenda si hay más de una serie
    xAxis: {
      type: 'category',
      data: props.chartData.labels,
      axisLabel: {
        // Rotar etiquetas si son muy largas (útil para nombres o fechas)
        rotate: props.chartData.labels && props.chartData.labels.length > 5 ? 30 : 0,
        interval: 0, // Asegura que todas las etiquetas se muestren
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          // Formateo simple para que los números grandes sean más legibles
          if (value >= 1000000) return `${value / 1000000}M`
          if (value >= 1000) return `${value / 1000}k`
          return value
        },
      },
    },
    series: props.chartData.datasets.map((ds) => ({
      name: ds.label,
      type: props.chartType,
      data: ds.data,
      smooth: props.chartType === 'line', // Curvas suaves para líneas
      // Paleta de colores básica si no se define en los datos
      itemStyle: {
        color: props.chartType === 'bar' ? '#5470C6' : '#91CC75', // Azul para barras, verde para líneas
      },
      barWidth: '60%', // Ancho de las barras
    })),
  }
})
</script>

<style scoped>
.dynamic-chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.chart-container {
  width: 100%;
}
</style>
