<template>
  <q-form @submit.prevent="submitForm">
    <q-input v-model="vehicle.brand" label="Marca" outlined />
    <q-input v-model="vehicle.model" label="Modelo" outlined />
    <q-input v-model="vehicle.year" label="Año" type="number" outlined />
    <q-input v-model="vehicle.plate" label="Placa" outlined />

    <q-select
      v-model="vehicle.status"
      :options="statusOptions"
      label="Estado"
      outlined
      emit-value
      map-options
    />

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
import { useQuasar } from 'quasar' // Importa useQuasar para usar las notificaciones

export default {
  name: 'VehicleForm',
  setup() {
    // Usamos setup para acceder a useQuasar en Options API
    const $q = useQuasar()
    return { $q } // Hacemos $q disponible en el componente
  },
  data() {
    return {
      // Siempre inicializa 'vehicle' como un objeto con todas sus propiedades esperadas
      vehicle: {
        brand: '',
        model: '',
        year: null,
        plate: '',
        status: '',
      },
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
    // Si hay un ID en los parámetros de la ruta, estamos en modo edición
    if (this.$route.params.id) {
      this.isEditMode = true
      try {
        const response = await VehicleService.getVehicleById(this.$route.params.id)

        // **VALIDACIÓN Y ASIGNACIÓN MEJORADA:**
        // Asegúrate de que response.data exista y sea un objeto
        if (response && typeof response === 'object' && response !== null) {
          // Asigna las propiedades directamente, esto garantiza que 'vehicle'
          // no sea reemplazado por undefined/null si el backend devuelve un 200 con cuerpo vacío
          // o si response.data es el objeto directamente.
          this.vehicle = { ...this.vehicle, ...response } // Fusiona las propiedades existentes con las cargadas
        } else {
          console.error('La respuesta para getVehicleById no es un objeto válido:', response)
          this.$q.notify({
            type: 'negative',
            message: 'Error: Formato de datos del vehículo inesperado.',
          })
        }
      } catch (error) {
        console.error('Error al cargar el vehículo para edición:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cargar el vehículo para edición.' })
        // Mantén 'this.vehicle' inicializado con valores por defecto para evitar errores en el template
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
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error al guardar el vehículo'
        this.$q.notify({ type: 'negative', message: errorMessage })
      }
    },
  },
}
</script>

<style scoped>
/* Tus estilos aquí */
</style>
