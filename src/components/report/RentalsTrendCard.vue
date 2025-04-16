<template>
  <q-card class="metric-card">
    <q-card-section>
      <h2>Tendencias de Alquileres</h2>
      <ul v-if="trends.length > 0">
        <li v-for="trend in trends" :key="trend.period">
          {{ trend.period }}: {{ trend.rentalCount }} alquileres
        </li>
      </ul>
      <p v-else>No hay tendencias de alquileres disponibles.</p>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  trends: {
    type: Array,
    required: true,
    default: () => [],
  },
})
</script>

<style scoped>
/* Los estilos de metric-card ya están en MetricCard.vue */
</style>
