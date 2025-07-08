<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">{{ vehicle?.brand }} {{ vehicle?.model }}</div>
      <div>Año: {{ vehicle?.year }}</div>
      <div>Placa: {{ vehicle?.plate }}</div>
      <div>
        Estado:
        <q-badge :color="badgeColor">
          {{ statusDescription }}
        </q-badge>
      </div>
      <div>Creado: {{ formattedCreatedAt }}</div>
    </q-card-section>
    <q-card-actions>
      <q-btn label="Editar" @click="goToEdit" color="primary" :disable="!vehicle?.id" />
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
      vehicle: {}, // Inicializado como objeto vacío para evitar errores de referencia inicial
    }
  },
  computed: {
    statusDescription() {
      // Usamos encadenamiento opcional para acceder a 'status' de forma segura
      const status = this.vehicle?.status
      const mapping = {
        AVAILABLE: 'Disponible',
        RENTED: 'Alquilado',
        MAINTENANCE: 'En Mantenimiento',
        OUT_OF_SERVICE: 'Fuera de Servicio',
      }
      // Devuelve la descripción mapeada, el propio status si no se mapea, o 'Desconocido' si no hay status
      return mapping[status] || status || 'Desconocido'
    },
    badgeColor() {
      // Usamos encadenamiento opcional para acceder a 'status' de forma segura
      const status = this.vehicle?.status
      const colors = {
        AVAILABLE: 'green',
        RENTED: 'blue',
        MAINTENANCE: 'orange',
        OUT_OF_SERVICE: 'grey',
      }
      // Devuelve el color mapeado o 'primary' (azul por defecto en Quasar) si no hay status o no coincide
      return colors[status] || 'primary'
    },
    formattedCreatedAt() {
      // Usamos encadenamiento opcional para acceder a 'createdAt' de forma segura
      if (this.vehicle?.createdAt) {
        return date.formatDate(this.vehicle.createdAt, 'YYYY-MM-DD HH:mm')
      }
      return '' // Devuelve cadena vacía si no hay fecha
    },
  },
  async created() {
    try {
      // Obtenemos el ID del parámetro de la ruta
      const vehicleId = this.$route.params.id
      console.log('DEBUG (VehicleDetails): ID de la ruta:', vehicleId) // Confirma el ID que se está utilizando

      // Verificación básica para asegurar que el ID no es nulo/indefinido
      if (!vehicleId) {
        console.error(
          'DEBUG (VehicleDetails): ID de vehículo es nulo o indefinido. No se puede cargar.',
        )
        this.$q.notify({ type: 'negative', message: 'ID de vehículo no válido.' })
        return // Detiene la ejecución si el ID es inválido
      }

      // Llama al servicio para obtener los detalles del vehículo
      const response = await VehicleService.getVehicleById(vehicleId)

      // --- ¡¡¡ESTE ES EL console.log CRÍTICO PARA DEPURACIÓN!!! ---
      // Verificamos el contenido EXACTO del objeto 'response' completo antes de acceder a su 'data'
      console.log('DEBUG (VehicleDetails): Objeto response COMPLETO del servicio:', response)
      // --- Fin del console.log crítico ---

      this.vehicle = response.data // Asigna la data de la respuesta a 'vehicle'

      // Verificamos el contenido exacto de 'this.vehicle' después de la asignación
      console.log(
        'DEBUG (VehicleDetails): Contenido de this.vehicle DESPUÉS de la asignación:',
        this.vehicle,
      )

      // Verificación para saber si el objeto 'vehicle' está vacío después de la carga
      if (!this.vehicle || Object.keys(this.vehicle).length === 0) {
        console.warn(
          'DEBUG (VehicleDetails): El objeto vehicle está vacío o nulo después de cargar. Posiblemente no se encontró el ID en el backend.',
        )
        this.$q.notify({
          type: 'warning',
          message: 'No se encontraron detalles para este vehículo.',
        })
      }
    } catch (error) {
      console.error('DEBUG (VehicleDetails): Error al cargar los detalles del vehículo:', error)
      // Notifica al usuario un error general y sugiere revisar la consola
      this.$q.notify({
        type: 'negative',
        message:
          'Error al cargar los detalles del vehículo. Verifique la consola para más información.',
      })
    }
  },
  methods: {
    goToEdit() {
      // Usa el ID del objeto 'vehicle' cargado si está disponible, si no, usa el de la ruta
      const idToEdit = this.vehicle?.id || this.$route.params.id
      if (idToEdit) {
        this.$router.push(`/vehicles/edit/${idToEdit}`)
      } else {
        console.error('DEBUG (VehicleDetails): No se pudo obtener un ID válido para editar.')
        this.$q.notify({
          type: 'negative',
          message: 'No se puede editar: ID de vehículo no disponible.',
        })
      }
    },
    goBack() {
      this.$router.push('/vehicles')
    },
  },
}
</script>
