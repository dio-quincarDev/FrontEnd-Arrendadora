<script setup>
import { ref, onMounted } from 'vue'
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

const rental = ref({})
const vehicle = ref(null)
const customer = ref(null)
const loading = ref(true)
const showCancelDialog = ref(false)
const processing = ref(false)

onMounted(() => {
  loadRentalDetails()
})

async function loadRentalDetails() {
  loading.value = true
  try {
    const response = await RentalService.getRentalById(props.rentalId)
    rental.value = response.data

    if (rental.value.vehicleId) {
      const vehicleResponse = await VehicleService.getVehicleById(rental.value.vehicleId)
      vehicle.value = vehicleResponse.data
    }

    if (rental.value.customerId) {
      const customerResponse = await CustomerService.getCustomerById(rental.value.customerId)
      customer.value = customerResponse.data
    }
  } catch (error) {
    console.error('Error loading rental details:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los detalles',
      position: 'top',
    })
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
    ACTIVE: 'positive',
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
    await loadRentalDetails()
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

const goToEdit = () => router.push(`/rentals/edit/${props.rentalId}`)
const goBack = () => router.push('/rentals')
</script>

<template>
  <q-card class="q-pa-md rental-details-card">
    <q-card-section>
      <div class="text-h6">Detalles de la Renta #{{ rental.id }}</div>
      <q-separator class="q-my-md" />

      <template v-if="loading">
        <div class="text-center q-my-md">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-sm">Cargando detalles...</div>
        </div>
      </template>

      <template v-else>
        <div class="row q-col-gutter-md">
          <!-- Rental Info Column -->
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

          <!-- Vehicle and Customer Column -->
          <div class="col-12 col-md-6">
            <!-- Vehicle Card -->
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

            <!-- Customer Card -->
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
          </div>
        </div>
      </template>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        v-if="rental.rentalStatus === 'ACTIVE'"
        label="Cancelar"
        color="orange"
        @click="showCancelDialog = true"
        class="q-mr-sm"
      />
      <q-btn
        v-if="rental.rentalStatus === 'ACTIVE'"
        label="Editar"
        color="primary"
        @click="goToEdit"
        class="q-mr-sm"
      />
      <q-btn flat label="Volver" @click="goBack" />
    </q-card-actions>

    <!-- Cancel Confirmation Dialog -->
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
