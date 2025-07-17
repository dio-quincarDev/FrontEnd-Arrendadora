<template>
  <q-card style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">{{ isEditMode ? 'Editar Renta' : 'Crear Nueva Renta' }}</div>
    </q-card-section>

    <q-separator />

    <q-form ref="rentalFormRef" @submit.prevent="submitForm">
      <q-card-section>
        <q-select
          v-model="formData.vehicleId"
          :options="vehicles"
          option-value="value"
          option-label="label"
          label="Vehículo *"
          outlined
          dense
          emit-value
          map-options
          :rules="[(val) => !!val || 'Por favor, selecciona un vehículo']"
          :loading="loadingVehicles"
          :disable="loadingVehicles || isEditMode"
          class="q-mb-md"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-model="formData.customerId"
          :options="customers"
          option-value="value"
          option-label="label"
          label="Cliente *"
          outlined
          dense
          emit-value
          map-options
          :rules="[(val) => !!val || 'Por favor, selecciona un cliente']"
          :loading="loadingCustomers"
          :disable="loadingCustomers || isEditMode"
          class="q-mb-md"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.startDate"
              label="Fecha Inicio *"
              outlined
              dense
              :rules="[(val) => !!val || 'Por favor, selecciona la fecha de inicio']"
            >
              <template v-slot:append>
                <q-icon name="sym_o_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.startDate"
                      mask="YYYY-MM-DD"
                      @update:model-value="updateEndDate"
                      color="accent"
                      v-close-popup
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.startTime"
              label="Hora Inicio *"
              outlined
              dense
              mask="##:##"
              :rules="[(val) => !!val || 'Por favor, selecciona la hora de inicio']"
            >
              <template v-slot:append>
                <q-icon name="sym_o_access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="formData.startTime" format24h color="accent" v-close-popup />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.endDate"
              label="Fecha Fin *"
              outlined
              dense
              :rules="[
                (val) => !!val || 'Por favor, selecciona la fecha de fin',
                // La validación combinada de fecha/hora se hace en submitForm
              ]"
            >
              <template v-slot:append>
                <q-icon name="sym_o_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.endDate"
                      mask="YYYY-MM-DD"
                      :min="formData.startDate"
                      color="accent"
                      v-close-popup
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.endTime"
              label="Hora Fin *"
              outlined
              dense
              mask="##:##"
              :rules="[(val) => !!val || 'Por favor, selecciona la hora de fin']"
            >
              <template v-slot:append>
                <q-icon name="sym_o_access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="formData.endTime" format24h color="accent" v-close-popup />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <q-select
          v-model="formData.chosenPricingTier"
          :options="pricingTierOptions"
          label="Nivel de Precios *"
          outlined
          dense
          emit-value
          map-options
          class="q-mb-md"
          :rules="[(val) => !!val || 'Por favor, selecciona un nivel de precios']"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" flat color="grey" @click="onCancel" />
        <q-btn
          :label="isEditMode ? 'Guardar Cambios' : 'Crear Renta'"
          type="submit"
          color="accent"
          unelevated
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import RentalService from 'src/services/rental.service'
import VehicleService from 'src/services/vehicle.service'
import CustomerService from 'src/services/customer.service'

const props = defineProps({
  rentalToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['rental-saved', 'cancel'])

const isEditMode = computed(() => !!props.rentalToEdit)

const $q = useQuasar()
const rentalFormRef = ref(null)
const loading = ref(false)
const loadingVehicles = ref(false)
const loadingCustomers = ref(false)

const formData = ref({
  vehicleId: null,
  customerId: null,
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'), // Solo fecha
  startTime: '08:00', // Hora separada por defecto
  endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'), // Solo fecha
  endTime: '08:00', // Hora separada por defecto
  rentalStatus: 'ACTIVE', // Estado por defecto para nuevas rentas
  chosenPricingTier: 'STANDARD', // Valor por defecto para el nuevo atributo
})

const vehicles = ref([])
const customers = ref([])

const pricingTierOptions = [
  { label: 'Estándar', value: 'STANDARD' },
  { label: 'Promocional', value: 'PROMOTIONAL' },
  { label: 'Premium', value: 'PREMIUM' },
]

onMounted(async () => {
  await Promise.all([loadVehicles(), loadCustomers()])
})

watch(
  () => props.rentalToEdit,
  (newRental) => {
    if (newRental) {
      // Al editar, desglosar la fecha y hora completas en campos separados
      const parsedStartDate = date.extractDate(newRental.startDate, 'YYYY-MM-DD HH:mm:ss')
      const parsedEndDate = date.extractDate(newRental.endDate, 'YYYY-MM-DD HH:mm:ss')

      formData.value = {
        ...newRental,
        startDate: date.formatDate(parsedStartDate, 'YYYY-MM-DD'),
        startTime: date.formatDate(parsedStartDate, 'HH:mm'),
        endDate: date.formatDate(parsedEndDate, 'YYYY-MM-DD'),
        endTime: date.formatDate(parsedEndDate, 'HH:mm'),
        chosenPricingTier: newRental.chosenPricingTier || 'STANDARD',
      }
    } else {
      // Reiniciar formData para nuevas rentas
      formData.value = {
        vehicleId: null,
        customerId: null,
        startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
        startTime: '08:00',
        endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
        endTime: '08:00',
        rentalStatus: 'ACTIVE',
        chosenPricingTier: 'STANDARD',
      }
    }
  },
  { immediate: true },
)

async function loadVehicles() {
  loadingVehicles.value = true
  try {
    const res = await VehicleService.getVehicles()
    const allVehicles = Array.isArray(res) ? res : []
    const availableVehicles = allVehicles.filter((v) => v.status === 'AVAILABLE')

    vehicles.value = availableVehicles.map((v) => {
      return {
        label: `${v.brand} ${v.model} (${v.year})`,
        value: v.id,
        description: `Placa: ${v.plate}`,
        type: v.type, // Asumiendo que el tipo de vehículo viene en la respuesta
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
    const customersData = await CustomerService.getCustomers()
    const rentalsResponse = await RentalService.getRentals()
    const allRentals = Array.isArray(rentalsResponse.data) ? rentalsResponse.data : []
    const activeCustomerIds = new Set(
      allRentals
        .filter((rental) => rental.rentalStatus === 'ACTIVE')
        .map((rental) => rental.customerId),
    )

    if (Array.isArray(customersData)) {
      const availableCustomers = customersData.filter(
        (customer) => !activeCustomerIds.has(customer.id),
      )
      customers.value = availableCustomers.map((c) => ({
        label: `${c.name}`,
        value: c.id,
        description: `Licencia: ${c.license} - Tel: ${c.phone}`,
      }))
    } else {
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



// Ajusta la fecha de fin si la fecha de inicio cambia y la de fin es anterior
function updateEndDate() {
  if (formData.value.startDate) {
    const startDay = date.extractDate(formData.value.startDate, 'YYYY-MM-DD')
    const endDay = date.extractDate(formData.value.endDate, 'YYYY-MM-DD')

    if (date.isBefore(endDay, startDay, 'day')) {
      formData.value.endDate = formData.value.startDate
      formData.value.endTime = formData.value.startTime
    } else if (date.isSame(endDay, startDay, 'day')) {
      if (formData.value.endTime < formData.value.startTime) {
        formData.value.endTime = formData.value.startTime
      }
    }
  }
  rentalFormRef.value.validate('endDate')
}

async function submitForm() {
  const isValid = await rentalFormRef.value.validate()
  if (!isValid) {
    $q.notify({ type: 'negative', message: 'Por favor, corrige los errores.' })
    return
  }

  // Combinar fecha y hora para enviar al backend
  const fullStartDate = `${formData.value.startDate} ${formData.value.startTime}:00`
  const fullEndDate = `${formData.value.endDate} ${formData.value.endTime}:00`

  // **Validación final de la fecha y hora de fin combinada**
  if (new Date(fullEndDate) < new Date(fullStartDate)) {
    $q.notify({
      type: 'negative',
      message: 'La fecha y hora de fin debe ser posterior o igual a la de inicio.',
    })
    return
  }

  loading.value = true
  try {
    const dataToSend = {
      vehicleId: formData.value.vehicleId,
      customerId: formData.value.customerId,
      startDate: fullStartDate,
      endDate: fullEndDate,
      rentalStatus: formData.value.rentalStatus,
      chosenPricingTier: formData.value.chosenPricingTier,
    }

    if (isEditMode.value) {
      await RentalService.updateRental(props.rentalToEdit.id, dataToSend)
      $q.notify({ type: 'positive', message: 'Renta actualizada correctamente' })
    } else {
      await RentalService.createRental(dataToSend)
      $q.notify({ type: 'positive', message: 'Renta creada correctamente' })
    }

    emit('rental-saved')
  } catch (error) {
    console.error('Error al guardar la renta:', error)
    const errorMessage = error.response?.data?.message || 'Error al guardar la renta.'
    $q.notify({ type: 'negative', message: errorMessage })
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  emit('cancel')
}
</script>

<style scoped lang="scss">
/* Tus estilos aquí */
</style>
