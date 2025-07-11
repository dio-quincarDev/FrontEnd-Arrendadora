<template>
  <!-- El componente ahora es una q-card para ser usado en un diálogo -->
  <q-card style="width: 500px; max-width: 90vw">
    <q-card-section>
      <!-- Título dinámico -->
      <div class="text-h6">{{ isEditMode ? 'Editar Cliente' : 'Crear Nuevo Cliente' }}</div>
    </q-card-section>

    <q-separator />

    <!-- Usamos q-form para aprovechar su validación -->
    <q-form ref="customerFormRef" @submit.prevent="submitForm">
      <q-card-section>
        <q-input
          v-model="formData.name"
          label="Nombre *"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa el nombre']"
        />

        <q-input
          v-model="formData.email"
          label="Email *"
          type="email"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="emailRules"
        />

        <q-input
          v-model="formData.license"
          label="Identificación *"
          outlined
          dense
          class="q-mb-md"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa la identificación']"
        />

        <q-input
          v-model="formData.phone"
          label="Teléfono *"
          type="tel"
          outlined
          dense
          lazy-rules
          :rules="phoneRules"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <!-- CAMBIO: Botón de cancelar que emite un evento -->
        <q-btn label="Cancelar" flat color="grey" @click="onCancel" />
        <q-btn
          :label="isEditMode ? 'Guardar Cambios' : 'Crear Cliente'"
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
import CustomerService from 'src/services/customer.service'
import { useQuasar } from 'quasar'
import { ref, watch, computed } from 'vue' // Usamos el Composition API para un manejo más limpio

export default {
  name: 'CustomerForm',
  // CAMBIO: Definimos la prop y los eventos
  props: {
    // El cliente a editar. Si es null, es modo creación.
    customerToEdit: {
      type: Object,
      default: null,
    },
  },
  emits: ['customer-saved', 'cancel'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const customerFormRef = ref(null) // Referencia al q-form
    const loading = ref(false)

    // CAMBIO: Usamos un objeto reactivo local para los datos del formulario
    // para no mutar las props directamente.
    const formData = ref({
      name: '',
      email: '',
      license: '',
      phone: '',
    })

    // CAMBIO: El modo edición se calcula basándose en la prop
    const isEditMode = computed(() => !!props.customerToEdit)

    // CAMBIO: Usamos un 'watch' para llenar el formulario cuando la prop cambie
    watch(
      () => props.customerToEdit,
      (newCustomer) => {
        if (newCustomer) {
          // Modo edición: copiamos los datos de la prop al formulario
          formData.value = { ...newCustomer }
        } else {
          // Modo creación: reseteamos el formulario
          formData.value = {
            name: '',
            email: '',
            license: '',
            phone: '',
          }
        }
      },
      { immediate: true }, // 'immediate' ejecuta el watch en cuanto el componente se crea
    )

    // Reglas de validación (sin cambios)
    const emailRules = [
      (val) => !!val || 'Por favor, ingresa el correo electrónico',
      (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un correo electrónico válido',
    ]
    const phoneRules = [
      (val) => !!val || 'Por favor, ingresa el teléfono',
      (val) =>
        /^\+\d{1,3}\d{8,16}$/.test(val) || 'Formato de teléfono inválido  (ej: +5076XXXXXXX)',
    ]

    // CAMBIO: La lógica de submit ahora está en el setup
    const submitForm = async () => {
      const isValid = await customerFormRef.value.validate()
      if (!isValid) {
        $q.notify({ type: 'negative', message: 'Por favor, corrige los errores.' })
        return
      }

      loading.value = true
      try {
        const dataToSend = {
          name: formData.value.name,
          email: formData.value.email,
          license: formData.value.license,
          phone: formData.value.phone,
          customerStatus: 'ACTIVE', // Mantenemos un estado por defecto
        }

        if (isEditMode.value) {
          await CustomerService.updateCustomer(props.customerToEdit.id, dataToSend)
          $q.notify({ type: 'positive', message: 'Cliente actualizado correctamente' })
        } else {
          await CustomerService.createCustomer(dataToSend)
          $q.notify({ type: 'positive', message: 'Cliente creado correctamente' })
        }

        // CAMBIO: Emitimos un evento de éxito en lugar de navegar
        emit('customer-saved')
      } catch (error) {
        console.error('Error al guardar el cliente:', error)
        const errorMessage = error.response?.data?.message || 'Error al guardar el cliente.'
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
      customerFormRef,
      loading,
      isEditMode,
      emailRules,
      phoneRules,
      submitForm,
      onCancel,
    }
  },
}
</script>
