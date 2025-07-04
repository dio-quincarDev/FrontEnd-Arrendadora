<script setup>
import { ref, onMounted, computed } from 'vue' // Importa 'computed'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import RentalService from 'src/services/rental.service'
import VehicleService from 'src/services/vehicle.service'
import CustomerService from 'src/services/customer.service'

const props = defineProps({
  rentalId: {
    type: [String, Number],
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()

const rental = ref({}) // Inicializa como objeto vacío
const vehicle = ref(null)
const customer = ref(null)
const loading = ref(true) // Indica que se está cargando (ya sea detalles o decidiendo si es 'new')
const showCancelDialog = ref(false)
const processing = ref(false)

// Nueva propiedad computada para detectar si la ruta es para una 'nueva' renta
const isNewRental = computed(() => props.rentalId === 'new')

onMounted(() => {
  // Solo intenta cargar detalles de la renta si NO es el caso de 'new'
  if (!isNewRental.value) {
    loadRentalDetails()
  } else {
    // Si es una 'nueva' renta, no necesitamos cargar nada, así que desactiva el estado de carga
    loading.value = false
    // Limpia el objeto rental por si había datos de una navegación previa
    rental.value = {}
  }
})

async function loadRentalDetails() {
  loading.value = true
  try {
    const response = await RentalService.getRentalById(props.rentalId)
    rental.value = response.data

    // Carga de vehículo si existe el ID
    if (rental.value.vehicleId) {
      const vehicleResponse = await VehicleService.getVehicleById(rental.value.vehicleId)
      vehicle.value = vehicleResponse.data
    } else {
      vehicle.value = null // Asegura que no haya datos de vehículo si el ID es nulo
    }

    // Carga de cliente si existe el ID
    if (rental.value.customerId) {
      const customerResponse = await CustomerService.getCustomerById(rental.value.customerId)
      customer.value = customerResponse.data
    } else {
      customer.value = null // Asegura que no haya datos de cliente si el ID es nulo
    }
  } catch (error) {
    console.error('Error al cargar detalles de la renta:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los detalles. La renta podría no existir.',
      position: 'top',
    })
    // Redirige a la lista de rentas si no se puede cargar una existente
    router.push('/rentals')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => date.formatDate(dateString, 'DD/MM/YYYY')
const formatDateTime = (dateString) => date.formatDate(dateString, 'DD/MM/YYYY HH:mm')
const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)

const getStatusColor = (status) => {
  const statusColors = {
    RENTED: 'positive', // Asumiendo 'RENTED' como estado activo inicial para nuevas rentas
    COMPLETED: 'primary',
    CANCELLED: 'negative',
  }
  return statusColors[status] || 'grey'
}

async function confirmCancel() {
  processing.value = true
  try {
    await RentalService.cancelRental(props.rentalId)
    $q.notify({
      type: 'positive',
      message: 'Renta cancelada correctamente',
      position: 'top',
    })
    await loadRentalDetails() // Vuelve a cargar los detalles para actualizar el estado
  } catch (error) {
    console.error('Error al cancelar la renta:', error)
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

const goToEdit = () => router.push(`/rentals/edit/${props.rentalId}`)
const goBack = () => router.push('/rentals')
</script>

<template>
  <q-card class="q-pa-md rental-details-card">
    <q-card-section>
      <div class="text-h6">
        <template v-if="isNewRental"> Nueva Renta </template>
        <template v-else> Detalles de la Renta #{{ rental.id }} </template>
      </div>
      <q-separator class="q-my-md" />

      <template v-if="loading">
        <div class="text-center q-my-md">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-sm">Cargando detalles...</div>
        </div>
      </template>

      <template v-else>
        <div v-if="isNewRental" class="text-center q-my-lg text-grey-7">
          Este componente está diseñado para **ver los detalles** de una renta existente.<br />
          Para crear una nueva renta, por favor, navegue a la sección de **creación de rentas**.
        </div>

        <div v-else-if="rental.id" class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Estado</q-item-label>
                  <q-item-label>
                    <q-badge :color="getStatusColor(rental.rentalStatus)">
                      {{ rental.rentalStatus }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Inicio</q-item-label>
                  <q-item-label>{{ formatDate(rental.startDate) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Fin</q-item-label>
                  <q-item-label>{{ formatDate(rental.endDate) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Precio</q-item-label>
                  <q-item-label>{{ formatCurrency(rental.totalPrice) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="rental.createdAt">
                <q-item-section>
                  <q-item-label caption>Creado</q-item-label>
                  <q-item-label>{{ formatDateTime(rental.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-6">
            <q-card v-if="vehicle" flat bordered class="q-mb-md">
              <q-card-section>
                <div class="text-subtitle2">Vehículo</div>
                <q-separator class="q-my-sm" />
                <div class="text-h6">
                  {{ vehicle.make }} {{ vehicle.model }} ({{ vehicle.year }})
                </div>
                <div class="q-mt-sm">
                  <span>Placa: {{ vehicle.licensePlate }}</span> |
                  <span>Color: {{ vehicle.color }}</span>
                </div>
                <div>Tarifa diaria: {{ formatCurrency(vehicle.dailyRate) }}</div>
              </q-card-section>
            </q-card>
            <div v-else class="text-grey-7 q-mb-md">No hay información de vehículo disponible.</div>

            <q-card v-if="customer" flat bordered>
              <q-card-section>
                <div class="text-subtitle2">Cliente</div>
                <q-separator class="q-my-sm" />
                <div class="text-h6">{{ customer.firstName }} {{ customer.lastName }}</div>
                <div>DNI: {{ customer.documentNumber }}</div>
                <div>Tel: {{ customer.phoneNumber }}</div>
                <div>Email: {{ customer.email }}</div>
              </q-card-section>
            </q-card>
            <div v-else class="text-grey-7">No hay información de cliente disponible.</div>
          </div>
        </div>
        <div v-else class="text-center q-my-lg text-grey-7">
          No se encontraron detalles para la renta especificada.
        </div>
      </template>
    </q-card-section>

    <q-card-actions align="right">
      <template v-if="!isNewRental && rental.id">
        <q-btn
          v-if="rental.rentalStatus === 'RENTED'"
          label="Cancelar"
          color="orange"
          @click="showCancelDialog = true"
          class="q-mr-sm"
          :disable="processing"
        />
        <q-btn
          v-if="rental.rentalStatus === 'RENTED'"
          label="Editar"
          color="primary"
          @click="goToEdit"
          class="q-mr-sm"
        />
      </template>
      <q-btn flat label="Volver" @click="goBack" />
    </q-card-actions>

    <q-dialog v-model="showCancelDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Confirmar cancelación</q-card-section>
        <q-card-section>
          ¿Está seguro que desea cancelar esta renta? Esta acción no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="No" v-close-popup />
          <q-btn
            flat
            label="Sí, cancelar"
            color="orange"
            @click="confirmCancel"
            :loading="processing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<style scoped>
.rental-details-card {
  max-width: 1000px;
  margin: auto;
}

@media (max-width: 600px) {
  .rental-details-card {
    padding: 12px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }
}
</style>
