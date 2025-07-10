<template>
  <q-card flat class="q-pa-md">
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col">
          <h2 class="text-h5 text-dark q-my-none">Gestión de Vehículos</h2>
          <p class="text-grey-7 q-mb-none">Aquí puedes administrar todos tus vehículos.</p>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-table :rows="vehicles" :columns="columns" row-key="id" :loading="loading" flat>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getBadgeColor(props.row.status)">
              {{ getStatusDescription(props.row.status) }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              icon="sym_o_edit"
              color="primary"
              flat
              round
              dense
              @click="emitEditEvent(props.row)"
            >
              <q-tooltip>Editar Vehículo</q-tooltip>
            </q-btn>
            <q-btn
              v-if="isAdmin"
              icon="sym_o_delete"
              color="negative"
              flat
              round
              dense
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Eliminar Vehículo</q-tooltip>
            </q-btn>
            <q-btn
              icon="sym_o_info"
              color="info"
              flat
              round
              dense
              @click="emitDetailsEvent(props.row)"
            >
              <q-tooltip>Ver Detalles</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data="{ filter }">
          <div class="full-width row flex-center text-accent q-gutter-sm q-pa-lg">
            <q-icon size="2em" name="sym_o_sentiment_dissatisfied" />
            <span>
              No hay vehículos disponibles.
              <span v-if="filter"> para la búsqueda "{{ filter }}"</span>
            </span>
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>

  <q-dialog v-model="showDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="sym_o_warning" color="warning" text-color="white" class="q-mr-md" />
        <span class="q-ml-sm">
          ¿Estás seguro de que quieres eliminar el vehículo
          <strong>"{{ vehicleToDelete ? vehicleToDelete.brand + ' ' + vehicleToDelete.model : '' }}"</strong>? Esta acción no se
          puede deshacer.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          label="Eliminar"
          color="negative"
          unelevated
          :disable="!isAdmin"
          @click="deleteVehicle"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import VehicleService from 'src/services/vehicle.service'
import { jwtDecode } from 'jwt-decode'
import { useQuasar } from 'quasar'

export default {
  name: 'VehicleTable',
  emits: ['edit-vehicle', 'view-details'],
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      vehicles: [],
      columns: [
        { name: 'brand', label: 'Marca', field: 'brand', align: 'left', sortable: true },
        { name: 'model', label: 'Modelo', field: 'model', align: 'left', sortable: true },
        { name: 'year', label: 'Año', field: 'year', align: 'left', sortable: true },
        { name: 'plate', label: 'Placa', field: 'plate', align: 'left', sortable: true },
        {
          name: 'status',
          label: 'Estado',
          field: 'status',
          align: 'center',
          format: (val) => this.getStatusDescription(val),
          sortable: true,
        },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
      ],
      loading: false,
      showDialog: false,
      vehicleToDelete: null,
    }
  },
  computed: {
    isAdmin() {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return false
      }
      try {
        const decodedToken = jwtDecode(token)
        const userRole = decodedToken.role || ''
        return userRole === 'ADMIN'
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        return false
      }
    },
  },
  async created() {
    await this.loadVehicles()
  },
  methods: {
    async refresh() {
      await this.loadVehicles()
    },
    getBadgeColor(status) {
      if (!status) return 'grey'
      const colors = {
        AVAILABLE: 'green',
        RENTED: 'blue',
        MAINTENANCE: 'orange',
        OUT_OF_SERVICE: 'grey',
      }
      return colors[status] || 'primary'
    },
    getStatusDescription(status) {
      if (!status) return 'Desconocido'
      const mapping = {
        AVAILABLE: 'Disponible',
        RENTED: 'Alquilado',
        MAINTENANCE: 'En Mantenimiento',
        OUT_OF_SERVICE: 'Fuera de Servicio',
      }
      return mapping[status] || status
    },
    async loadVehicles() {
      this.loading = true
      try {
        const data = await VehicleService.getVehicles()
        this.vehicles = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar vehículos:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al cargar vehículos',
          position: 'top',
        })
        this.vehicles = []
      } finally {
        this.loading = false
      }
    },
    emitEditEvent(vehicle) {
      this.$emit('edit-vehicle', vehicle)
    },
    emitDetailsEvent(vehicle) {
      this.$emit('view-details', vehicle)
    },
    confirmDelete(vehicle) {
      this.vehicleToDelete = vehicle
      this.showDialog = true
    },
    async deleteVehicle() {
      this.loading = true
      try {
        await VehicleService.deleteVehicle(this.vehicleToDelete.id)
        this.$q.notify({ type: 'positive', message: 'Vehículo eliminado correctamente' })
        await this.loadVehicles()
      } catch (error) {
        console.error('Error al eliminar el vehículo:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al eliminar el vehículo',
          position: 'top',
        })
      } finally {
        this.showDialog = false
        this.loading = false
        this.vehicleToDelete = null
      }
    },
  },
}
</script>

<style scoped lang="scss">
/* No se necesitan estilos adicionales aquí, la consistencia la da app.scss */
</style>
