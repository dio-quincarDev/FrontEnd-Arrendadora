<template>
  <q-card flat class="q-pa-md">
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col">
          <h2 class="text-h5 text-dark q-my-none">Gestión de Rentas</h2>
          <p class="text-grey-7 q-mb-none">Aquí puedes administrar todas tus rentas.</p>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-table
        :rows="rentals"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        flat
      >
        <template #body-cell-startDate="props">
          <q-td :props="props">
            {{ formatDate(props.row.startDate) }}
          </q-td>
        </template>

        <template #body-cell-endDate="props">
          <q-td :props="props">
            {{ formatDate(props.row.endDate) }}
          </q-td>
        </template>

        <template #body-cell-totalPrice="props">
          <q-td :props="props">
            {{ formatCurrency(props.row.totalPrice) }}
          </q-td>
        </template>

        <template #body-cell-rentalStatus="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.rentalStatus)">
              {{ props.row.rentalStatus }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
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

                <q-item
                  clickable
                  v-close-popup
                  @click="emitEditEvent(props.row)"
                  :disable="props.row.rentalStatus === 'CANCELLED'"
                >
                  <q-item-section avatar>
                    <q-icon name="sym_o_edit" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Editar</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="confirmCancel(props.row)"
                  :disable="props.row.rentalStatus !== 'ACTIVE'"
                >
                  <q-item-section avatar>
                    <q-icon name="sym_o_cancel" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Cancelar Renta</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="isAdmin" />

                <q-item
                  v-if="isAdmin"
                  clickable
                  v-close-popup
                  @click="confirmDelete(props.row)"
                  :disable="props.row.rentalStatus === 'ACTIVE'"
                >
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
      </q-table>
    </q-card-section>
  </q-card>

  <q-dialog v-model="showCancelDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="sym_o_warning" color="warning" text-color="white" class="q-mr-md" />
        <span class="q-ml-sm">
          ¿Estás seguro de que quieres cancelar la renta
          <strong>#{{ cancelRentalId }}</strong
          >? Esta acción no se puede deshacer.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          label="Confirmar"
          color="orange"
          unelevated
          @click="confirmCancelAction"
          :loading="processing"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDeleteDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="sym_o_warning" color="warning" text-color="white" class="q-mr-md" />
        <span class="q-ml-sm">
          ¿Estás seguro de que quieres eliminar la renta
          <strong>#{{ deleteRentalId }}</strong
          >? Esta acción no se puede deshacer.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          label="Eliminar"
          color="negative"
          unelevated
          @click="confirmDeleteAction"
          :loading="processing"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import RentalService from 'src/services/rental.service'
import { jwtDecode } from 'jwt-decode'

const $q = useQuasar()

const rentals = ref([])
const loading = ref(false)
const processing = ref(false)
const showCancelDialog = ref(false)
const showDeleteDialog = ref(false)
const cancelRentalId = ref(null)
const deleteRentalId = ref(null)

const columns = [
  { name: 'customerName', label: 'Cliente', field: 'customerName', align: 'left', sortable: true },
  {
    name: 'vehicle',
    label: 'Vehículo',
    field: (row) => `${row.vehicleBrand} ${row.vehicleModel}`,
    align: 'left',
    sortable: true,
  },
  { name: 'startDate', label: 'Fecha Inicio', field: 'startDate', align: 'left', sortable: true },
  { name: 'endDate', label: 'Fecha Fin', field: 'endDate', align: 'left', sortable: true },
  {
    name: 'totalPrice',
    label: 'Precio Total',
    field: 'totalPrice',
    align: 'right',
    sortable: true,
  },
  { name: 'rentalStatus', label: 'Estado', field: 'rentalStatus', align: 'center', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center', sortable: false },
]

const pagination = ref({
  sortBy: 'startDate',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const isAdmin = computed(() => {
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
})

onMounted(() => {
  loadRentals()
})

const refresh = async () => {
  await loadRentals()
}

const formatDate = (dateString) => date.formatDate(dateString, 'DD/MM/YYYY')
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const getStatusColor = (status) => {
  const statusColors = {
    PENDING: 'negative',
    ACTIVE: 'positive',
    COMPLETED: 'primary',
    CANCELLED: 'negative',
  }
  return statusColors[status] || 'grey'
}

const emit = defineEmits(['edit-rental', 'view-details'])

const emitEditEvent = (rental) => {
  emit('edit-rental', rental)
}

const emitDetailsEvent = (rental) => {
  emit('view-details', rental)
}

async function loadRentals() {
  loading.value = true
  try {
    const response = await RentalService.getRentals()
    if (Array.isArray(response.data)) {
      rentals.value = response.data
      pagination.value.rowsNumber = response.data.length
    } else {
      console.error('Error: La respuesta de getRentals no es un array:', response.data)
      rentals.value = []
      pagination.value.rowsNumber = 0
      $q.notify({
        type: 'negative',
        message: 'Error: Los datos de las rentas no se recibieron en el formato esperado',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error loading rentals:', error)
    rentals.value = []
    pagination.value.rowsNumber = 0
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las rentas',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const confirmCancel = (row) => {
  cancelRentalId.value = row.id
  showCancelDialog.value = true
}

const confirmDelete = (row) => {
  deleteRentalId.value = row.id
  showDeleteDialog.value = true
}

async function confirmCancelAction() {
  processing.value = true
  try {
    await RentalService.cancelRental(cancelRentalId.value)
    $q.notify({
      type: 'positive',
      message: 'Renta cancelada correctamente',
      position: 'top',
    })
    await loadRentals()
  } catch (error) {
    console.error('Error cancelling rental:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cancelar la renta',
      position: 'top',
    })
  } finally {
    showCancelDialog.value = false
    processing.value = false
  }
}

async function confirmDeleteAction() {
  processing.value = true
  try {
    await RentalService.deleteRental(deleteRentalId.value)
    $q.notify({
      type: 'positive',
      message: 'Renta eliminada correctamente',
      position: 'top',
    })
    await loadRentals()
  } catch (error) {
    console.error('Error deleting rental:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar la renta',
      position: 'top',
    })
  } finally {
    showDeleteDialog.value = false
    processing.value = false
  }
}

defineExpose({ refresh })
</script>

<style scoped lang="scss">
.action-buttons {
  white-space: nowrap;
}
</style>