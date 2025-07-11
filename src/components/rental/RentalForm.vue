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
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6">
            <q-input
              v-model="formData.endDate"
              label="Fecha Fin *"
              outlined
              dense
              :rules="[
                (val) => !!val || 'Por favor, selecciona la fecha de fin',
                (val) =>
                  isValidEndDate(val) ||
                  'La fecha de fin debe ser posterior o igual a la de inicio',
              ]"
            >
              <template v-slot:append>
                <q-icon name="sym_o_event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formData.endDate"
                      mask="YYYY-MM-DD"
                      :options="(date) => isValidEndDate(date)"
                      color="accent"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <q-input
          v-model.number="formData.totalPrice"
          label="Precio Total *"
          type="number"
          outlined
          dense
          min="0"
          step="0.01"
          prefix="$"
          readonly
          :rules="[(val) => val >= 0 || 'El precio debe ser cero o mayor']"
          class="q-mb-md"
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
import { ref, watch, computed, onMounted } from 'vue'
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

const $q = useQuasar()
const rentalFormRef = ref(null)
const loading = ref(false)
const loadingVehicles = ref(false)
const loadingCustomers = ref(false)

const formData = ref({
  vehicleId: null,
  customerId: null,
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
  endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
  totalPrice: 0,
  rentalStatus: 'ACTIVE', // Estado por defecto para nuevas rentas
})

const vehicles = ref([])
const customers = ref([])
const dailyRates = ref({})

const isEditMode = computed(() => !!props.rentalToEdit)

onMounted(async () => {
  await Promise.all([loadVehicles(), loadCustomers()])
})

watch(
  () => props.rentalToEdit,
  (newRental) => {
    if (newRental) {
      formData.value = {
        ...newRental,
        startDate: date.formatDate(newRental.startDate, 'YYYY-MM-DD'),
        endDate: date.formatDate(newRental.endDate, 'YYYY-MM-DD'),
      }
    } else {
      formData.value = {
        vehicleId: null,
        customerId: null,
        startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
        endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
        totalPrice: 0,
        rentalStatus: 'ACTIVE',
      }
    }
  },
  { immediate: true },
)

watch(
  [() => formData.value.startDate, () => formData.value.endDate, () => formData.value.vehicleId],
  () => {
    calculatePrice()
  },
  { deep: true },
)

async function loadVehicles() {
  loadingVehicles.value = true
  try {
    const res = await VehicleService.getVehicles()
    const allVehicles = Array.isArray(res) ? res : []

    vehicles.value = allVehicles.map((v) => {
      dailyRates.value[v.id] = v.dailyRate || 0
      return {
        label: `${v.brand} ${v.model} (${v.year})`,
        value: v.id,
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
    const customersData = await CustomerService.getCustomers()
    if (Array.isArray(customersData)) {
      customers.value = customersData.map((c) => ({
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

function isValidEndDate(dateStr) {
  return (
    dateStr && formData.value.startDate && new Date(dateStr) >= new Date(formData.value.startDate)
  )
}

function updateEndDate() {
  if (
    formData.value.startDate &&
    new Date(formData.value.endDate) < new Date(formData.value.startDate)
  ) {
    formData.value.endDate = date.formatDate(
      date.addToDate(new Date(formData.value.startDate), { days: 1 }),
      'YYYY-MM-DD',
    )
  }
}

function calculatePrice() {
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.endDate)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1
  const rate = dailyRates.value[formData.value.vehicleId] || 0
  formData.value.totalPrice = parseFloat((days * rate).toFixed(2))
}

async function submitForm() {
  const isValid = await rentalFormRef.value.validate()
  if (!isValid) {
    $q.notify({ type: 'negative', message: 'Por favor, corrige los errores.' })
    return
  }

  loading.value = true
  try {
    const dataToSend = {
      vehicleId: formData.value.vehicleId,
      customerId: formData.value.customerId,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      totalPrice: formData.value.totalPrice,
      rentalStatus: formData.value.rentalStatus,
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
