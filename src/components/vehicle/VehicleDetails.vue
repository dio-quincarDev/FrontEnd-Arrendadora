<!-- src/components/vehicle/VehicleDetails.vue -->
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ vehicle.brand }} {{ vehicle.model }}</div>
      <div>Año: {{ vehicle.year }}</div>
      <div>Placa: {{ vehicle.plate }}</div>
      <div>
        Estado:
        <q-badge :color="badgeColor">
          {{ statusDescription }}
        </q-badge>
      </div>
      <div>Creado: {{ formattedCreatedAt }}</div>
    </q-card-section>
    <q-card-actions>
      <q-btn label="Editar" @click="goToEdit" color="primary" />
      <q-btn label="Volver" @click="goBack" flat />
    </q-card-actions>
  </q-card>
</template>

<script>
import VehicleService from 'src/services/vehicle.service'
import { date } from 'quasar'

export default {
  name: 'VehicleDetails',
  data() {
    return {
      vehicle: {},
    }
  },
  computed: {
    // Mapea el valor del status a su descripción
    statusDescription() {
      const mapping = {
        AVAILABLE: 'Disponible',
        RENTED: 'Alquilado',
        MAINTENANCE: 'En Mantenimiento',
        OUT_OF_SERVICE: 'Fuera de Servicio',
      }
      return mapping[this.vehicle.status] || this.vehicle.status
    },
    // Ejemplo para definir un color basado en el estado
    badgeColor() {
      const colors = {
        AVAILABLE: 'green',
        RENTED: 'blue',
        MAINTENANCE: 'orange',
        OUT_OF_SERVICE: 'grey',
      }
      return colors[this.vehicle.status] || 'primary'
    },
    formattedCreatedAt() {
      if (this.vehicle.createdAt) {
        return date.formatDate(this.vehicle.createdAt, 'YYYY-MM-DD HH:mm')
      }
      return ''
    },
  },
  async created() {
    try {
      const response = await VehicleService.getVehicleById(this.$route.params.id)
      this.vehicle = response.data
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.$q.notify({ type: 'negative', message: 'Error al cargar los detalles del vehículo' })
    }
  },
  methods: {
    goToEdit() {
      this.$router.push(`/vehicles/edit/${this.$route.params.id}`)
    },
    goBack() {
      this.$router.push('/vehicles')
    },
  },
}
</script>
