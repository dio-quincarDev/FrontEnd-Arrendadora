<!-- src/components/vehicle/VehicleForm.vue -->
<template>
  <q-form @submit.prevent="submitForm">
    <q-input v-model="vehicle.brand" label="Marca" outlined />
    <q-input v-model="vehicle.model" label="Modelo" outlined />
    <q-input v-model="vehicle.year" label="Año" type="number" outlined />
    <q-input v-model="vehicle.plate" label="Placa" outlined />
    <q-select v-model="vehicle.status" :options="statusOptions" label="Estado" outlined />
    <q-btn
      :label="isEditMode ? 'Guardar' : 'Crear'"
      type="submit"
      color="primary"
      class="q-mt-md"
    />
  </q-form>
</template>

<script>
import VehicleService from 'src/services/vehicle.service'

export default {
  name: 'VehicleForm',
  data() {
    return {
      vehicle: {
        brand: '',
        model: '',
        year: null,
        plate: '',
        status: '',
      },
      // Opciones basadas en el enum VehicleStatus
      statusOptions: [
        { label: 'Disponible', value: 'AVAILABLE' },
        { label: 'Alquilado', value: 'RENTED' },
        { label: 'En Mantenimiento', value: 'MAINTENANCE' },
        { label: 'Fuera de Servicio', value: 'OUT_OF_SERVICE' },
      ],
      isEditMode: false,
    }
  },
  async created() {
    if (this.$route.params.id) {
      this.isEditMode = true
      try {
        const response = await VehicleService.getVehicleById(this.$route.params.id)
        this.vehicle = response.data
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al cargar el vehículo' })
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        if (this.isEditMode) {
          await VehicleService.updateVehicle(this.$route.params.id, this.vehicle)
          this.$q.notify({ type: 'positive', message: 'Vehículo actualizado correctamente' })
        } else {
          await VehicleService.createVehicle(this.vehicle)
          this.$q.notify({ type: 'positive', message: 'Vehículo creado correctamente' })
        }
        this.$router.push('/vehicles')
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al guardar el vehículo' })
      }
    },
  },
}
</script>
