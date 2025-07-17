<template>
  <q-card flat class="q-pa-md">
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col">
          <h2 class="text-h5 text-dark q-my-none">Gestión de Vehículos</h2>
          <p class="text-grey-7 q-mb-none">Aquí puedes administrar todos tus vehículos.</p>
        </div>
        <div class="col-12 col-md-auto">
          <q-input
            outlined
            dense
            v-model="filter"
            placeholder="Buscar vehículo..."
            clearable
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-table
        :rows="filteredVehicles"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :grid="isMobile"
        :hide-header="isMobile"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-item">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h6">{{ props.row.brand }} {{ props.row.model }}</div>
                <div class="text-subtitle2 text-grey-8">{{ props.row.plate }}</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="flex flex-center">
                <q-list dense>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_category" /></q-item-section>
                    <q-item-section
                      >Tipo: {{ getVehicleTypeDescription(props.row.vehicleType) }}</q-item-section
                    >
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_calendar_today" /></q-item-section>
                    <q-item-section>Año: {{ props.row.year }}</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_info" /></q-item-section>
                    <q-item-section
                      >Estado:
                      <q-badge :color="getBadgeColor(props.row.status)">{{
                        getStatusDescription(props.row.status)
                      }}</q-badge></q-item-section
                    >
                  </q-item>
                </q-list>
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_info"
                  color="info"
                  @click="emitDetailsEvent(props.row)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="primary"
                  @click="emitEditEvent(props.row)"
                />
                <q-btn
                  v-if="isAdmin"
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  color="negative"
                  @click="confirmDelete(props.row)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getBadgeColor(props.row.status)">
              {{ getStatusDescription(props.row.status) }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn-dropdown flat round dense dropdown-icon="sym_o_more_vert" no-icon-animation>
              <q-list dense>
                <q-item clickable v-close-popup @click="emitDetailsEvent(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_info" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ver Detalles</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="emitEditEvent(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_edit" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Editar</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="isAdmin" />

                <q-item v-if="isAdmin" clickable v-close-popup @click="confirmDelete(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_delete" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Eliminar (Admin)</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
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
          <strong
            >"{{
              vehicleToDelete ? vehicleToDelete.brand + ' ' + vehicleToDelete.model : ''
            }}"</strong
          >? Esta acción no se puede deshacer.
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
      filter: '',
      columns: [
        { name: 'brand', label: 'Marca', field: 'brand', align: 'left', sortable: true },
        { name: 'model', label: 'Modelo', field: 'model', align: 'left', sortable: true },
        {
          name: 'vehicleType',
          label: 'Tipo de Vehículo',
          field: 'vehicleType',
          align: 'left',
          sortable: true,
          format: (val) => this.getVehicleTypeDescription(val),
        },
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
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center', sortable: false },
      ],
      loading: false,
      showDialog: false,
      vehicleToDelete: null,
    }
  },
  computed: {
    isMobile() {
      return this.$q.screen.lt.md
    },
    filteredVehicles() {
      if (!this.filter) {
        return this.vehicles
      }
      const lowerCaseFilter = this.filter.toLowerCase()
      return this.vehicles.filter(
        (vehicle) =>
          vehicle.brand.toLowerCase().includes(lowerCaseFilter) ||
          vehicle.model.toLowerCase().includes(lowerCaseFilter) ||
          vehicle.plate.toLowerCase().includes(lowerCaseFilter) ||
          this.getVehicleTypeDescription(vehicle.vehicleType)
            .toLowerCase()
            .includes(lowerCaseFilter) ||
          this.getStatusDescription(vehicle.status).toLowerCase().includes(lowerCaseFilter),
      )
    },
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
    getVehicleTypeDescription(type) {
      const mapping = {
        PICKUP: 'Doble Cabina',
        SUV: 'Camioneta',
        SEDAN: 'Sedan',
        HATCHBACK: 'Hatchback',
      }
      return mapping[type] || type
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
