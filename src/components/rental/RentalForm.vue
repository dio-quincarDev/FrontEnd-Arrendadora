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
          @update:model-value="onVehicleChange"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="getVehicleTypeColor(scope.opt.type)"
                  :label="getVehicleTypeDisplayName(scope.opt.vehicleType)"
                  class="text-capitalize"
                />
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
              label="Fecha de Inicio *"
              outlined
              dense
              readonly
              :rules="[(val) => !!val || 'Por favor, selecciona la fecha de inicio']"
            >
              <template v-slot:append>
                <q-icon name="sym_o_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.startDate"
                      mask="YYYY-MM-DD"
                      color="accent"
                      :options="disablePastDates"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.endDate"
              label="Fecha de Fin *"
              outlined
              dense
              readonly
              :rules="[(val) => !!val || 'Por favor, selecciona la fecha de fin']"
            >
              <template v-slot:append>
                <q-icon name="sym_o_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.endDate"
                      mask="YYYY-MM-DD"
                      color="accent"
                      :options="disableStartDate"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
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

          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.endTime"
              label="Hora Fin *"
              outlined
              dense
              mask="##:##"
              :rules="[
                (val) => !!val || 'Por favor, selecciona la hora de fin',
                validateEndTime,
              ]"
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

        <!-- CAMPO REACTIVO DE TARIFAS -->
        <q-select
          v-model="formData.chosenPricingTier"
          :options="availablePricingTiers"
          option-value="value"
          option-label="label"
          label="Nivel de Precios *"
          outlined
          dense
          emit-value
          map-options
          :loading="loadingPricingTiers"
          :disable="!formData.vehicleId || loadingPricingTiers"
          class="q-mb-md"
          :rules="[(val) => !!val || 'Por favor, selecciona un nivel de precios']"
          @update:model-value="onPricingTierChange"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption class="text-positive">
                  ${{ scope.opt.price }}/día
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="getPricingTierColor(scope.opt.value)" :label="scope.opt.value" />
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ formData.vehicleId ? 'Cargando tarifas...' : 'Selecciona un vehículo primero' }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- PREVIEW DE PRECIO CALCULADO -->
        <q-card
          v-if="selectedPricingInfo && rentalDuration"
          class="pricing-preview q-mt-md"
          flat
          bordered
        >
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-subtitle2 text-primary">
                  {{ selectedPricingInfo.label }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ selectedVehicleInfo?.label }}
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="text-h6 text-positive">${{ selectedPricingInfo.price }}/día</div>
                <div class="text-caption text-grey-7">{{ rentalDuration }} día(s)</div>
                <div class="text-body1 text-weight-medium">Total: ${{ totalPrice }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
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

import { useRentalCalculations } from 'src/composables/useRentalCalculations';

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
const loadingPricingTiers = ref(false)

const formData = ref({
  vehicleId: null,
  customerId: null,
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
  endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
  startTime: '08:00',
  endTime: '08:00',
  rentalStatus: 'ACTIVE',
  chosenPricingTier: null,
})

const disableStartDate = (d) => {
  return d >= formData.value.startDate.replace(/-/g, '/')
}

const vehicles = ref([])
const customers = ref([])
const availablePricingTiers = ref([])

// CONFIGURACIÓN DE TARIFAS POR TIPO DE VEHÍCULO (SINCRONIZADO CON BACKEND ENUM)
const pricingConfig = {
  PICKUP: [
    { label: 'Promocional', value: 'PROMOTIONAL', price: 72.0 },
    { label: 'Estándar', value: 'STANDARD', price: 80.0 },
    { label: 'Premium', value: 'PREMIUM', price: 92.0 },
  ],
  SUV: [
    { label: 'Promocional', value: 'PROMOTIONAL', price: 67.5 },
    { label: 'Estándar', value: 'STANDARD', price: 75.0 },
    { label: 'Premium', value: 'PREMIUM', price: 86.25 },
  ],
  SEDAN: [
    { label: 'Promocional', value: 'PROMOTIONAL', price: 36.0 },
    { label: 'Estándar', value: 'STANDARD', price: 40.0 },
    { label: 'Premium', value: 'PREMIUM', price: 46.0 },
  ],
  HATCHBACK: [
    { label: 'Promocional', value: 'PROMOTIONAL', price: 31.5 },
    { label: 'Estándar', value: 'STANDARD', price: 35.0 },
    { label: 'Premium', value: 'PREMIUM', price: 40.25 },
  ],
  DEFAULT: [
    { label: 'Promocional', value: 'PROMOTIONAL', price: 36.0 },
    { label: 'Estándar', value: 'STANDARD', price: 40.0 },
    { label: 'Premium', value: 'PREMIUM', price: 46.0 },
  ],
}

// COMPUTED PROPERTIES
const selectedVehicleInfo = computed(() => {
  return vehicles.value.find((v) => v.value === formData.value.vehicleId)
})

const selectedPricingInfo = computed(() => {
  return availablePricingTiers.value.find((p) => p.value === formData.value.chosenPricingTier)
})

const { rentalDuration, totalPrice } = useRentalCalculations(formData, selectedPricingInfo);


// MÉTODOS DE CARGA
onMounted(async () => {
  await Promise.all([loadVehicles(), loadCustomers()])
})

async function loadVehicles() {
  loadingVehicles.value = true
  try {
    const res = await VehicleService.getVehicles()
    const allVehicles = Array.isArray(res) ? res : []
    const availableVehicles = allVehicles.filter((v) => v.status === 'AVAILABLE')

    vehicles.value = availableVehicles.map((v) => {
      console.log(`Vehículo ${v.id}: Tipo original -> ${v.vehicleType}`); // DEBUGGING: Usando vehicleType
      return {
        label: `${v.brand} ${v.model} (${v.year})`,
        value: v.id,
        description: `Placa: ${v.plate}`,
        type: v.vehicleType?.toString().toUpperCase().trim() || 'DEFAULT', // Usando vehicleType
        dailyRate: v.dailyRate, // Asegurar que dailyRate esté disponible
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
    }
  } catch (e) {
    console.error('Error al cargar clientes:', e)
    $q.notify({ type: 'negative', message: 'Error al cargar clientes.', position: 'top' })
    customers.value = []
  } finally {
    loadingCustomers.value = false
  }
}

// MÉTODO REACTIVO PARA CAMBIO DE VEHÍCULO
async function onVehicleChange(vehicleId) {
  if (!vehicleId) {
    availablePricingTiers.value = []
    formData.value.chosenPricingTier = null
    return
  }

  loadingPricingTiers.value = true

  try {
    const selectedVehicle = vehicles.value.find((v) => v.value === vehicleId)
    if (!selectedVehicle) {
      throw new Error('Vehículo no encontrado')
    }

    const vehicleType = selectedVehicle.type?.toUpperCase().trim() || 'DEFAULT'
    console.log(`DEBUG: vehicleType normalizado: '${vehicleType}'`)
    const pricingOptions = pricingConfig[vehicleType] || pricingConfig.DEFAULT
    console.log(`DEBUG: pricingOptions seleccionadas:`, pricingOptions)

    availablePricingTiers.value = [...pricingOptions]

    // Auto-seleccionar STANDARD si está disponible
    const standardOption = availablePricingTiers.value.find((p) => p.value === 'STANDARD')
    if (standardOption && !formData.value.chosenPricingTier) {
      formData.value.chosenPricingTier = standardOption.value
    }

    $q.notify({
      type: 'info',
      message: `Tarifas para ${getVehicleTypeDisplayName(vehicleType)} cargadas correctamente`,
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('❌ Error al cargar tarifas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las tarifas del vehículo',
      position: 'top',
    })
    availablePricingTiers.value = []
  } finally {
    loadingPricingTiers.value = false
  }
}

function onPricingTierChange(pricingTier) {
  if (pricingTier && selectedPricingInfo.value) {
    $q.notify({
      type: 'positive',
      message: `Tarifa ${selectedPricingInfo.value.label} seleccionada: ${selectedPricingInfo.value.price}/día`,
      position: 'top',
      timeout: 2000,
    })
  }
}

// MÉTODOS DE UTILIDAD
function getVehicleTypeColor(type) {
  const colors = {
    PICKUP: 'brown',
    SUV: 'green',
    SEDAN: 'blue',
    HATCHBACK: 'purple',
    DEFAULT: 'grey',
  }
  return colors[type] || 'grey'
}

function getVehicleTypeDisplayName(type) {
  const displayNames = {
    PICKUP: 'Doble Cabina',
    SUV: 'Camioneta',
    SEDAN: 'Sedan',
    HATCHBACK: 'Hatchback',
  }
  return displayNames[type] || type // Si no se encuentra, devuelve el tipo original
}

function getPricingTierColor(tier) {
  const colors = {
    PROMOTIONAL: 'green',
    STANDARD: 'blue',
    PREMIUM: 'orange',
  }
  return colors[tier] || 'grey'
}

// WATCHERS
watch(
  () => props.rentalToEdit,
  (newRental) => {
    if (newRental) {
      const parsedStartDate = date.extractDate(newRental.startDate, 'YYYY-MM-DD HH:mm:ss')
      const parsedEndDate = date.extractDate(newRental.endDate, 'YYYY-MM-DD HH:mm:ss')

      formData.value = {
        ...newRental,
        dateRange: {
          from: date.formatDate(parsedStartDate, 'YYYY-MM-DD'),
          to: date.formatDate(parsedEndDate, 'YYYY-MM-DD'),
        },
        startTime: date.formatDate(parsedStartDate, 'HH:mm'),
        endTime: date.formatDate(parsedEndDate, 'HH:mm'),
        chosenPricingTier: newRental.chosenPricingTier || null,
      }

      // Cargar tarifas para el vehículo editado
      if (newRental.vehicleId) {
        onVehicleChange(newRental.vehicleId)
      }
    } else {
      formData.value = {
        vehicleId: null,
        customerId: null,
        dateRange: {
          from: date.formatDate(new Date(), 'YYYY-MM-DD'),
          to: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
        },
        startTime: '08:00',
        endTime: '08:00',
        rentalStatus: 'ACTIVE',
        chosenPricingTier: null,
      }
      availablePricingTiers.value = []
    }
  },
  { immediate: true },
)

const disablePastDates = (d) => {
  const today = date.formatDate(new Date(), 'YYYY/MM/DD')
  return d >= today
}

const validateEndTime = (val) => {
  if (!val || !formData.value.startTime || !formData.value.dateRange.from || !formData.value.dateRange.to) {
    return true
  }
  if (formData.value.dateRange.from === formData.value.dateRange.to) {
    if (val < formData.value.startTime) {
      return 'La hora de fin no puede ser anterior a la de inicio en el mismo día.'
    }
  }
  return true
}

watch(
  () => formData.value.startDate,
  (newDate) => {
    if (formData.value.endDate < newDate) {
      formData.value.endDate = newDate
    }
  },
)


async function submitForm() {
  const isValid = await rentalFormRef.value.validate()
  if (!isValid) {
    $q.notify({ type: 'negative', message: 'Por favor, corrige los errores.' })
    return
  }

  const fullStartDate = `${formData.value.dateRange.from} ${formData.value.startTime}:00`
  const fullEndDate = `${formData.value.dateRange.to} ${formData.value.endTime}:00`

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
.pricing-preview {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .q-card-section {
    padding: 12px 16px;
  }
}

.q-badge {
  font-size: 0.7rem;
  font-weight: 500;
}

.text-capitalize {
  text-transform: capitalize;
}
</style>
