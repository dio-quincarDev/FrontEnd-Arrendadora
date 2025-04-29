<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">Tendencias de Alquileres</div>
      <!-- Contenedor controlado para el gráfico -->
      <div class="chart-wrapper">
        <!-- Key reactiva para forzar re-render al cambiar datos -->
        <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue' // Añadimos ref y watch
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  trends: {
    type: Array,
    default: () => [],
  },
})

// Key reactiva para forzar re-render del gráfico cuando cambian los datos
const chartKey = ref(0)
watch(
  () => props.trends,
  () => {
    chartKey.value++
  },
)

const chartData = computed(() => ({
  labels: props.trends.map((t) => t.period),
  datasets: [
    {
      label: 'Alquileres',
      data: props.trends.map((t) => t.rentalCount),
      backgroundColor: '#1976D2',
      maxBarThickness: 50, // Control máximo de ancho de barras
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Permite que el gráfico se ajuste al contenedor
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0, // Muestra solo números enteros
        stepSize: 1, // Incrementos de 1 en 1
      },
    },
    x: {
      ticks: {
        autoSkip: true,
        maxRotation: 45, // Rotación de etiquetas para mejor legibilidad
        minRotation: 45,
        precision: 0,
      },
      // Mejor manejo de espacios entre barras
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    },
  },
  // Configuración para máximo valor del eje Y
  animation: {
    duration: 0, // Desactiva animación para mejor rendimiento
  },
}
</script>

<style scoped>
/* Contenedor principal del gráfico */
.chart-wrapper {
  position: relative; /* Necesario para responsive */
  height: 400px; /* Altura fija del contenedor */
  min-height: 300px; /* Altura mínima para móviles */
}

/* Sobreescribe estilos de Chart.js */
canvas {
  width: 100% !important; /* Fuerza ancho completo */
  height: 100% !important; /* Fuerza altura completa */
  max-height: 100%; /* Previene desbordamiento vertical */
}
</style>
