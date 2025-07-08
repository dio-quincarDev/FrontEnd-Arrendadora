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

// MODIFICADO: Inicialización completa de rental para asegurar reactividad y valores por defecto
const rental = ref({
  id: null,
  vehicleId: null,
  customerId: null,
  startDate: date.formatDate(new Date(), 'YYYY-MM-DD'),
  endDate: date.formatDate(date.addToDate(new Date(), { days: 1 }), 'YYYY-MM-DD'),
  totalPrice: 0,
  rentalStatus: null, // AÑADIDO: Si esperas esta propiedad
  createdAt: null, // AÑADIDO: Si esperas esta propiedad
})

const vehicles = ref([])
const customers = ref([])
const dailyRates = ref({})

const requiredRule = (val) => !!val || 'Campo requerido'
const priceRule = (val) => val >= 0 || 'El precio debe ser cero o mayor' // MODIFICADO: Precio puede ser 0
const validateEndDate = (val) =>
  isValidEndDate(val) || 'La fecha de fin debe ser posterior o igual a la fecha de inicio' // MODIFICADO: Mensaje y lógica

const canCalculatePrice = computed(() => {
  return (
    rental.value.vehicleId &&
    rental.value.startDate &&
    rental.value.endDate &&
    isValidEndDate(rental.value.endDate) &&
    dailyRates.value[rental.value.vehicleId] !== undefined // AÑADIDO: Asegura que la tarifa diaria exista
  )
})

onMounted(async () => {
  // AÑADIDO: Comprobación para establecer isEditMode basada en props.rentalId
  isEditMode.value = props.rentalId && props.rentalId !== 'new'

  await Promise.all([loadVehicles(), loadCustomers()]) // Carga vehículos y clientes primero

  if (isEditMode.value) {
    // Usa la variable isEditMode
    await loadRental() // Carga los detalles de la renta existente
  } else {
    // Si es una nueva renta, reinicia a valores predeterminados (ya hecho en la declaración de 'rental')
    // y no necesitas cargar una renta existente.
    // Asegurarse de que el precio total se reinicie a 0 para nuevas rentas
    rental.value.totalPrice = 0
  }
})

async function loadVehicles() {
  loadingVehicles.value = true
  try {
    // Correcto: se mantiene VehicleService.getVehicles()
    const res = await VehicleService.getVehicles()

    const allVehicles = Array.isArray(res) ? res : [] // Asegura que 'res' sea un array

    vehicles.value = allVehicles.map((v) => {
      // MODIFICADO: Asigna dailyRate si existe, si no, usa 0 (o un valor predeterminado)
      dailyRates.value[v.id] = v.dailyRate || 0

      return {
        // MODIFICADO: option-label ahora usa 'label' y 'description'
        label: `${v.brand} ${v.model} (${v.year})`,
        value: v.id, // El valor que se asignará al v-model
        description: `Placa: ${v.plate}`, // AÑADIDO para mostrar en el select
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
    // Correcto: se mantiene CustomerService.getCustomers()
    const customersData = await CustomerService.getCustomers()

    if (Array.isArray(customersData)) {
      customers.value = customersData.map((c) => ({
        // MODIFICADO: 'label' ahora usa 'name' y 'license'/'phone'
        label: `${c.name}`, // Asegúrate que 'name' es la propiedad que contiene el nombre completo
        value: c.id, // El valor que se asignará al v-model
        description: `Licencia: ${c.license} - Tel: ${c.phone}`, // AÑADIDO para mostrar en el select
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

async function loadRental() {
  try {
    const res = await RentalService.getRentalById(props.rentalId)
    const fetchedRental = res.data

    console.log(
      'Datos de la renta individuales cargados por getRentalById (fetchedRental):',
      fetchedRental,
    )

    if (fetchedRental && typeof fetchedRental === 'object' && fetchedRental !== null) {
      // MODIFICADO: Asegura que las fechas se carguen en formato YYYY-MM-DD para QDate
      rental.value = {
        id: fetchedRental.id,
        customerId: fetchedRental.customerId,
        vehicleId: fetchedRental.vehicleId,
        startDate: date.formatDate(fetchedRental.startDate, 'YYYY-MM-DD'), // MODIFICADO: Formato
        endDate: date.formatDate(fetchedRental.endDate, 'YYYY-MM-DD'), // MODIFICADO: Formato
        totalPrice: fetchedRental.totalPrice,
        rentalStatus: fetchedRental.rentalStatus || null, // AÑADIDO para cargar el estado si existe
        createdAt: fetchedRental.createdAt || null, // AÑADIDO para cargar la fecha de creación
      }
      // Después de cargar, si es modo edición y el precio es 0, recalcularlo (por si no se guardó)
      // O si el precio total viene 0, recalcularlo.
      if (isEditMode.value && (rental.value.totalPrice === 0 || !rental.value.totalPrice)) {
        calculatePrice()
      }
    } else {
      console.error(
        'La respuesta para getRentalById no contiene un objeto de renta válido en .data:',
        res,
      )
      $q.notify({
        type: 'negative',
        message: 'Error: Formato de datos de renta inesperado.',
        position: 'top',
      })
      router.push('/rentals')
    }
  } catch (e) {
    console.error('Error al cargar la renta para edición:', e)
    $q.notify({ type: 'negative', message: 'Error al cargar renta para edición.', position: 'top' })
    router.push('/rentals')
  }
}

function isValidEndDate(dateStr) {
  // MODIFICADO: Permite que la fecha de fin sea igual a la de inicio
  return dateStr && rental.value.startDate && new Date(dateStr) >= new Date(rental.value.startDate)
}

function updateEndDate() {
  // Asegura que endDate sea al menos startDate + 1 día si se selecciona startDate
  // o si endDate es anterior a startDate.
  if (rental.value.startDate && new Date(rental.value.endDate) < new Date(rental.value.startDate)) {
    rental.value.endDate = date.formatDate(
      date.addToDate(new Date(rental.value.startDate), { days: 1 }),
      'YYYY-MM-DD',
    )
  }
  calculatePrice() // AÑADIDO: Recalcular precio al cambiar fechas
}

function calculatePrice() {
  if (!canCalculatePrice.value) {
    // Usa el computed property
    rental.value.totalPrice = 0 // Si no puede calcular, resetea a 0
    return
  }
  const start = new Date(rental.value.startDate)
  const end = new Date(rental.value.endDate)
  // MODIFICADO: Asegura al menos 1 día de renta
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1
  const rate = dailyRates.value[rental.value.vehicleId] || 0
  rental.value.totalPrice = parseFloat((days * rate).toFixed(2)) // AÑADIDO: Formatear a 2 decimales
}

// AÑADIDO: Watchers para recalcular el precio automáticamente
// Vigila cambios en fechas o vehículo seleccionado
import { watch } from 'vue'
watch(
  () => rental.value.startDate,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      updateEndDate() // Ajusta endDate si startDate cambia
    }
  },
)
watch(() => rental.value.endDate, calculatePrice) // Recalcula precio al cambiar endDate
watch(() => rental.value.vehicleId, calculatePrice) // Recalcula precio al cambiar vehicleId

async function submitForm() {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await RentalService.updateRental(rental.value.id, rental.value)
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
          option-value="value"
          option-label="label"
          label="Vehículo *"
          outlined
          emit-value
          map-options
          :rules="[requiredRule]"
          :loading="loadingVehicles"
          :disable="submitting || (isEditMode && rental.rentalStatus !== 'ACTIVE')"
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
          v-model="rental.customerId"
          :options="customers"
          option-value="value"
          option-label="label"
          label="Cliente *"
          outlined
          emit-value
          map-options
          :rules="[requiredRule]"
          :loading="loadingCustomers"
          :disable="submitting || (isEditMode && rental.rentalStatus !== 'ACTIVE')"
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

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="rental.startDate"
              label="Fecha Inicio *"
              outlined
              :rules="[requiredRule]"
              :disable="submitting || (isEditMode && rental.rentalStatus !== 'ACTIVE')"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="rental.startDate"
                      mask="YYYY-MM-DD"
                      @update:model-value="updateEndDate"
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
              :disable="submitting || (isEditMode && rental.rentalStatus !== 'ACTIVE')"
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
            readonly
            :disable="submitting"
            class="col"
          />
          <q-btn
            v-if="!isEditMode"
            label="Calcular precio"
            color="secondary"
            @click="calculatePrice"
            :disable="!canCalculatePrice || submitting"
            class="q-ml-md"
          />
        </div>

        <div class="q-mt-lg">
          <q-btn
            :label="isEditMode ? 'Guardar Cambios' : 'Crear Renta'"
            type="submit"
            color="primary"
            :loading="submitting"
            :disable="submitting || (isEditMode && rental.rentalStatus !== 'ACTIVE')"
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
