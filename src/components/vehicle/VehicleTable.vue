<!-- src/components/vehicle/VehicleTable.vue -->
<template>
  <div>
    <q-table :rows="vehicles" :columns="columns">
      <template v-slot:body-cell-status="props">
        <q-badge :color="getBadgeColor(props.row.status)">
          {{ getStatusDescription(props.row.status) }}
        </q-badge>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-btn flat icon="visibility" @click="goToDetails(props.row.id)" />
        <q-btn flat icon="edit" @click="goToEdit(props.row.id)" />
        <q-btn flat icon="delete" @click="confirmDelete(props.row)" color="negative" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section> ¿Está seguro que desea eliminar este vehículo? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" @click="deleteVehicle" color="negative" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import VehicleService from 'src/services/vehicle.service'

export default {
  name: 'VehicleTable',
  data() {
    return {
      vehicles: [],
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'brand', label: 'Marca', field: 'brand', align: 'left' },
        { name: 'model', label: 'Modelo', field: 'model', align: 'left' },
        { name: 'year', label: 'Año', field: 'year', align: 'left' },
        { name: 'plate', label: 'Placa', field: 'plate', align: 'left' },
        { name: 'status', label: 'Estado', field: 'status', align: 'center' },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
      ],
      showDialog: false,
      vehicleToDelete: null,
    }
  },
  created() {
    this.loadVehicles()
  },
  methods: {
    async loadVehicles() {
      try {
        const response = await VehicleService.getVehicles()
        this.vehicles = response.data
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al cargar vehículos' })
      }
    },
    goToEdit(id) {
      this.$router.push(`/vehicles/edit/${id}`)
    },
    goToDetails(id) {
      this.$router.push(`/vehicles/${id}`)
    },
    confirmDelete(vehicle) {
      this.vehicleToDelete = vehicle
      this.showDialog = true
    },
    async deleteVehicle() {
      try {
        await VehicleService.deleteVehicle(this.vehicleToDelete.id)
        this.$q.notify({ type: 'positive', message: 'Vehículo eliminado correctamente' })
        this.loadVehicles()
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al eliminar el vehículo' })
      } finally {
        this.showDialog = false
      }
    },
    getStatusDescription(status) {
      const mapping = {
        AVAILABLE: 'Disponible',
        RENTED: 'Alquilado',
        MAINTENANCE: 'En Mantenimiento',
        OUT_OF_SERVICE: 'Fuera de Servicio',
      }
      return mapping[status] || status
    },
    getBadgeColor(status) {
      const colors = {
        AVAILABLE: 'green',
        RENTED: 'blue',
        MAINTENANCE: 'orange',
        OUT_OF_SERVICE: 'grey',
      }
      return colors[status] || 'primary'
    },
  },
}
</script>
