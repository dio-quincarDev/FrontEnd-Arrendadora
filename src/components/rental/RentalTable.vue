<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import RentalService from 'src/services/rental.service'

const router = useRouter()
const $q = useQuasar()

// Reactive state
const rentals = ref([])
const loading = ref(false)
const processing = ref(false)
const showCancelDialog = ref(false)
const showDeleteDialog = ref(false)
const cancelRentalId = ref(null)
const deleteRentalId = ref(null)

// Table configuration
const columns = [
  // { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true }, // Omitido
  // { name: 'vehicleId', label: 'ID Vehículo', field: 'vehicleId', align: 'left', sortable: true }, // Omitido
  // { name: 'customerId', label: 'ID Cliente', field: 'customerId', align: 'left', sortable: true }, // Omitido
  { name: 'customerName', label: 'Cliente', field: 'customerName', align: 'left', sortable: true },
  { name: 'vehicleBrand', label: 'Marca', field: 'vehicleBrand', align: 'left', sortable: true },
  { name: 'vehicleModel', label: 'Modelo', field: 'vehicleModel', align: 'left', sortable: true },
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
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

const pagination = ref({
  sortBy: 'startDate',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Lifecycle hooks
onMounted(() => {
  loadRentals()
})

// Data functions
// Data functions
async function loadRentals() {
  loading.value = true
  try {
    const response = await RentalService.getRentals()
    console.log('Respuesta de getRentals:', response) // Inspecciona la respuesta completa
    if (Array.isArray(response.data)) {
      rentals.value = response.data
      pagination.value.rowsNumber = response.data.length
    } else {
      console.error('Error: La respuesta de getRentals no es un array:', response.data)
      rentals.value = [] // Inicializa como array vacío en caso de error en la estructura
      pagination.value.rowsNumber = 0
      $q.notify({
        type: 'negative',
        message: 'Error: Los datos de las rentas no se recibieron en el formato esperado',
        position: 'top',
      })
    }
    console.log('Rentals data:', rentals.value) // Para debugging
  } catch (error) {
    console.error('Error loading rentals:', error)
    rentals.value = [] // Inicializa como array vacío en caso de error en la llamada
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

// Utility functions
const formatDate = (dateString) => date.formatDate(dateString, 'DD/MM/YYYY')
const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)

const getStatusColor = (status) => {
  const statusColors = {
    ACTIVE: 'positive',
    COMPLETED: 'primary',
    CANCELLED: 'negative',
  }
  return statusColors[status] || 'grey'
}

// Navigation functions
const goToEdit = (id) => router.push(`/rentals/edit/${id}`)
const goToDetails = (id) => router.push(`/rentals/${id}`)

// Action handlers
const confirmDelete = (row) => {
  deleteRentalId.value = row.id
  showDeleteDialog.value = true
}

const cancelRental = (id) => {
  cancelRentalId.value = id
  showCancelDialog.value = true
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
</script>

<template>
  <div class="rental-table-container">
    <q-table
      title="Gestión de Rentas"
      :rows="rentals"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      class="rental-table"
    >
      <template #top>
        <div class="text-h6">Gestión de Rentas</div>
        <q-space />
        <q-btn
          color="primary"
          icon="add"
          label="Nueva Renta"
          @click="router.push('/rentals/new')"
        />
      </template>

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
        <q-td :props="props" class="action-buttons">
          <q-btn flat round icon="visibility" @click="goToDetails(props.row.id)" size="sm" />
          <q-btn
            flat
            round
            icon="edit"
            @click="goToEdit(props.row.id)"
            size="sm"
            :disable="props.row.rentalStatus === 'CANCELLED'"
          />
          <q-btn
            flat
            round
            icon="cancel"
            color="orange"
            @click="cancelRental(props.row.id)"
            size="sm"
            :disable="props.row.rentalStatus !== 'ACTIVE'"
          />
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            @click="confirmDelete(props.row)"
            size="sm"
            :disable="props.row.rentalStatus === 'ACTIVE'"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showCancelDialog">
      <q-card class="confirmation-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Confirmar cancelación</div>
        </q-card-section>

        <q-card-section class="dialog-content">
          ¿Está seguro que desea cancelar esta renta?
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            label="Confirmar"
            color="orange"
            @click="confirmCancelAction"
            :loading="processing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteDialog">
      <q-card class="confirmation-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Confirmar eliminación</div>
        </q-card-section>

        <q-card-section class="dialog-content">
          ¿Está seguro que desea eliminar esta renta?
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="confirmDeleteAction"
            :loading="processing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.rental-table-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.rental-table {
  width: 100%;
}

.action-buttons {
  white-space: nowrap;
}

.confirmation-dialog {
  min-width: 350px;
}

.dialog-header {
  padding-bottom: 16px;
}

.dialog-content {
  padding-top: 0;
  padding-bottom: 24px;
}

.dialog-actions {
  padding: 8px 16px;
}

@media (max-width: 600px) {
  .rental-table {
    font-size: 0.9rem;
  }

  .action-buttons button {
    padding: 4px;
    min-width: 32px;
  }

  .confirmation-dialog {
    min-width: 280px;
  }
}
</style>
