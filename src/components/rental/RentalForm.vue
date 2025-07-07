<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import RentalService from 'src/services/rental.service'
import VehicleService from 'src/services/vehicle.service'
import CustomerService from 'src/services/customer.service'

const props = defineProps({
  rentalId: [String, Number],
})

const $q = useQuasar()
const router = useRouter()

const isEditMode = ref(false)
const submitting = ref(false)
const loadingVehicles = ref(false)
const loadingCustomers = ref(false)

const rental = ref({
  vehicleId: null,
  customerId: null,
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
  endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
  totalPrice: 0,
})

const vehicles = ref([])
const customers = ref([])
const dailyRates = ref({})

const requiredRule = (val) => !!val || 'Campo requerido'
const priceRule = (val) => val > 0 || 'El precio debe ser mayor a cero'

const validateEndDate = (val) =>
  isValidEndDate(val) || 'La fecha de fin debe ser posterior a la fecha de inicio'

const canCalculatePrice = computed(() => {
  return (
    rental.value.vehicleId &&
    rental.value.startDate &&
    rental.value.endDate &&
    isValidEndDate(rental.value.endDate)
  )
})

onMounted(async () => {
  await Promise.all([loadVehicles(), loadCustomers()])
  if (props.rentalId) {
    isEditMode.value = true
    await loadRental()
  }
})

async function loadVehicles() {
  loadingVehicles.value = true
  try {
    // *** CAMBIO CLAVE AQUÍ: Cambia 'getAvailableVehicles()' por 'getVehicles()' ***
    const res = await VehicleService.getVehicles()

    // El resto del código de mapeo para vehículos ya lo ajustamos:
    const availableVehicles = res.filter((v) => v.status === 'AVAILABLE')

    vehicles.value = availableVehicles.map((v) => {
      dailyRates.value[v.id] = 0 // Temporalmente 0, hasta que el backend proporcione dailyRate

      return {
        id: v.id,
        label: `${v.brand} ${v.model} (${v.year})`,
        description: `Placa: ${v.plate}`,
      }
    })
  } catch (e) {
    console.error('Error al cargar vehículos:', e)
    $q.notify({ type: 'negative', message: 'Error al cargar vehículos', position: 'top' })
  } finally {
    loadingVehicles.value = false
  }
}

async function loadCustomers() {
  loadingCustomers.value = true
  try {
    // *** CAMBIO CLAVE AQUÍ: await CustomerService.getCustomers() ya devuelve el array directo ***
    const customersData = await CustomerService.getCustomers()

    // Validamos que 'customersData' sea un array antes de mapear.
    if (Array.isArray(customersData)) {
      customers.value = customersData.map((c) => ({
        // Usamos 'customersData' directamente
        id: c.id,
        label: `${c.name}`,
        description: `Licencia: ${c.license} - Tel: ${c.phone}`,
      }))
    } else {
      // Si la data no es un array, registramos un error.
      console.error('La respuesta de clientes no contiene un array válido:', customersData)
      customers.value = []
      $q.notify({
        type: 'negative',
        message: 'Error: Formato de datos de clientes inesperado.',
        position: 'top',
      })
    }
  } catch (e) {
    console.error('Error al cargar clientes:', e)
    $q.notify({ type: 'negative', message: 'Error al cargar clientes.', position: 'top' })
    customers.value = []
  } finally {
    loadingCustomers.value = false
  }
}

async function loadRental() {
  try {
    const res = await RentalService.getRentalById(props.rentalId)
    rental.value = res.data
  } catch (e) {
    console.error('Error al cargar la renta:', e)
    $q.notify({ type: 'negative', message: 'Error al cargar renta', position: 'top' })
  }
}

function isValidEndDate(dateStr) {
  return new Date(dateStr) >= new Date(rental.value.startDate)
}

function updateEndDate() {
  if (!isValidEndDate(rental.value.endDate)) {
    rental.value.endDate = date.formatDate(
      date.addToDate(new Date(rental.value.startDate), { days: 1 }),
      'YYYY-MM-DD',
    )
  }
}

function calculatePrice() {
  const start = new Date(rental.value.startDate)
  const end = new Date(rental.value.endDate)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1
  const rate = dailyRates.value[rental.value.vehicleId] || 0
  rental.value.totalPrice = days * rate
}

async function submitForm() {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await RentalService.updateRental(props.rentalId, rental.value)
      $q.notify({ type: 'positive', message: 'Renta actualizada', position: 'top' })
    } else {
      await RentalService.createRental(rental.value)
      $q.notify({ type: 'positive', message: 'Renta creada', position: 'top' })
    }
    router.push('/rentals')
  } catch (e) {
    console.error('Error al guardar la renta:', e)
    $q.notify({
      type: 'negative',
      message: e.response?.data?.message || 'Error al guardar',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ isEditMode ? 'Editar Renta' : 'Nueva Renta' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="submitForm" class="q-gutter-md">
        <q-select
          v-model="rental.vehicleId"
          :options="vehicles"
          option-value="id"
          option-label="label"
          label="Vehículo *"
          outlined
          emit-value
          map-options
          :rules="[requiredRule]"
          :loading="loadingVehicles"
          :disable="isEditMode"
        />

        <q-select
          v-model="rental.customerId"
          :options="customers"
          option-value="id"
          option-label="label"
          label="Cliente *"
          outlined
          emit-value
          map-options
          :rules="[requiredRule]"
          :loading="loadingCustomers"
          :disable="isEditMode"
        />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="rental.startDate"
              label="Fecha Inicio *"
              outlined
              :rules="[requiredRule]"
              :disable="isEditMode"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="rental.startDate"
                      mask="YYYY-MM-DD"
                      :options="(date) => new Date(date) >= new Date()"
                      @input="updateEndDate"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="rental.endDate"
              label="Fecha Fin *"
              outlined
              :rules="[requiredRule, validateEndDate]"
              :disable="isEditMode"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="rental.endDate"
                      mask="YYYY-MM-DD"
                      :options="(date) => isValidEndDate(date)"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row items-center q-gutter-md">
          <q-input
            v-model.number="rental.totalPrice"
            label="Precio Total *"
            type="number"
            outlined
            min="0"
            step="0.01"
            prefix="$"
            :rules="[priceRule]"
            :readonly="isEditMode"
          />
          <q-btn
            v-if="!isEditMode"
            label="Calcular precio"
            color="secondary"
            @click="calculatePrice"
            :disable="!canCalculatePrice"
          />
        </div>

        <div class="q-mt-lg">
          <q-btn
            :label="isEditMode ? 'Guardar Cambios' : 'Crear Renta'"
            type="submit"
            color="primary"
            :loading="submitting"
            class="q-mr-sm"
          />
          <q-btn label="Cancelar" @click="() => router.push('/rentals')" flat color="grey" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.q-card {
  max-width: 800px;
  margin: auto;
}
</style>
