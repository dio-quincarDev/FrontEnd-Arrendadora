<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6 q-mb-md">Tendencias de Alquileres</div>
      <Bar :data="chartData" :options="chartOptions" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
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

const chartData = computed(() => ({
  labels: props.trends.map((t) => t.period),
  datasets: [
    {
      label: 'Alquileres',
      data: props.trends.map((t) => t.rentalCount),
      backgroundColor: '#1976D2',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}
</script>

<style scoped>
.q-card-section {
  height: 400px; /* espacio para el gráfico */
}
</style>
