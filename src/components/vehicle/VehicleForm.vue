<template>
  <q-card style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">{{ isEditMode ? 'Editar Vehículo' : 'Crear Nuevo Vehículo' }}</div>
    </q-card-section>

    <q-separator />

    <q-form ref="vehicleFormRef" @submit.prevent="submitForm">
      <q-card-section>
        <q-input
          v-model="formData.brand"
          label="Marca *"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa la marca']"
        />

        <q-input
          v-model="formData.model"
          label="Modelo *"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa el modelo']"
        />

        <q-input
          v-model="formData.year"
          label="Año *"
          type="number"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Por favor, ingresa el año',
            (val) => (val > 1900 && val < 2100) || 'Por favor, ingresa un año válido (ej: 2023)',
          ]"
        />

        <q-input
          v-model="formData.plate"
          label="Placa *"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa la placa']"
        />

        <q-select
          v-model="formData.vehicleType"
          :options="vehicleTypeOptions"
          label="Tipo de Vehículo *"
          outlined
          dense
          emit-value
          map-options
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => !!val || 'Por favor, selecciona un tipo de vehículo']"
        />

        <q-select
          v-model="formData.status"
          :options="statusOptions"
          label="Estado *"
          outlined
          dense
          emit-value
          map-options
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, selecciona un estado']"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn label="Cancelar" flat color="grey" @click="onCancel" />
        <q-btn
          :label="isEditMode ? 'Guardar Cambios' : 'Crear Vehículo'"
          type="submit"
          color="accent"
          unelevated
          :loading="loading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import VehicleService from 'src/services/vehicle.service'
import { useQuasar } from 'quasar'
import { ref, watch, computed } from 'vue'

export default {
  name: 'VehicleForm',
  props: {
    vehicleToEdit: {
      type: Object,
      default: null,
    },
  },
  emits: ['vehicle-saved', 'cancel'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const vehicleFormRef = ref(null)
    const loading = ref(false)

    const formData = ref({
      brand: '',
      model: '',
      year: null,
      plate: '',
      vehicleType: null,
      pricingTier: 'STANDARD', // Se establece por defecto y no se muestra
      status: 'AVAILABLE',
    })

    const vehicleTypeOptions = [
      { label: 'Doble Cabina', value: 'PICKUP' },
      { label: 'Camioneta', value: 'SUV' },
      { label: 'Sedan', value: 'SEDAN' },
      { label: 'Hatchback', value: 'HATCHBACK' },
    ]

    const statusOptions = [
      { label: 'Disponible', value: 'AVAILABLE' },
      { label: 'Alquilado', value: 'RENTED' },
      { label: 'En Mantenimiento', value: 'MAINTENANCE' },
      { label: 'Fuera de Servicio', value: 'OUT_OF_SERVICE' },
    ]

    const isEditMode = computed(() => !!props.vehicleToEdit)

    watch(
      () => props.vehicleToEdit,
      (newVehicle) => {
        if (newVehicle) {
          formData.value = {
            ...newVehicle,
            pricingTier: newVehicle.pricingTier || 'STANDARD', // Mantiene el existente o asigna STANDARD
          }
        } else {
          formData.value = {
            brand: '',
            model: '',
            year: null,
            plate: '',
            vehicleType: null,
            pricingTier: 'STANDARD',
            status: 'AVAILABLE',
          }
        }
      },
      { immediate: true },
    )

    const submitForm = async () => {
      const isValid = await vehicleFormRef.value.validate()
      if (!isValid) {
        $q.notify({ type: 'negative', message: 'Por favor, corrige los errores.' })
        return
      }

      loading.value = true
      try {
        const dataToSend = {
          brand: formData.value.brand,
          model: formData.value.model,
          year: formData.value.year,
          plate: formData.value.plate,
          vehicleType: formData.value.vehicleType,
          pricingTier: formData.value.pricingTier, // Se envía el valor (STANDARD o el existente)
          status: formData.value.status,
        }

        if (isEditMode.value) {
          await VehicleService.updateVehicle(props.vehicleToEdit.id, dataToSend)
          $q.notify({ type: 'positive', message: 'Vehículo actualizado correctamente' })
        } else {
          await VehicleService.createVehicle(dataToSend)
          $q.notify({ type: 'positive', message: 'Vehículo creado correctamente' })
        }

        emit('vehicle-saved')
      } catch (error) {
        console.error('Error al guardar el vehículo:', error)
        const errorMessage = error.response?.data?.message || 'Error al guardar el vehículo.'
        $q.notify({ type: 'negative', message: errorMessage })
      } finally {
        loading.value = false
      }
    }

    const onCancel = () => {
      emit('cancel')
    }

    return {
      formData,
      vehicleFormRef,
      loading,
      isEditMode,
      statusOptions,
      vehicleTypeOptions,
      submitForm,
      onCancel,
    }
  },
}
</script>

<style scoped lang="scss">
/* Tus estilos aquí */
</style>
