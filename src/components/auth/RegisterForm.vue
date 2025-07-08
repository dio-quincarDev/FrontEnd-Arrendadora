<template>
  <q-form @submit="onSubmit" class="q-gutter-md" ref="myForm">
    <q-input
      outlined
      v-model="form.email"
      label="Correo Electrónico *"
      aria-label="Correo electrónico"
      lazy-rules
      :rules="emailRules"
      autofocus
      autocomplete="email"
      color="primary"
      label-color="grey-7"
      input-class="text-grey-9"
      bottom-slots
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_mail" color="grey-7" />
      </template>
      <template v-slot:error="{ message }">
        <div class="text-red-7 error-message-wrapper">{{ message }}</div>
      </template>
    </q-input>

    <q-input
      outlined
      v-model="form.username"
      label="Nombre de usuario *"
      aria-label="Nombre de usuario"
      lazy-rules
      :rules="usernameRules"
      autocomplete="username"
      color="primary"
      label-color="grey-7"
      input-class="text-grey-9"
      bottom-slots
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_account_circle" color="grey-7" />
      </template>
      <template v-slot:error="{ message }">
        <div class="text-red-7 error-message-wrapper">{{ message }}</div>
      </template>
    </q-input>

    <q-input
      outlined
      v-model="form.password"
      :type="passwordFieldType"
      label="Contraseña *"
      aria-label="Contraseña"
      :rules="passwordRules"
      autocomplete="new-password"
      color="primary"
      label-color="grey-7"
      input-class="text-grey-9"
      bottom-slots
      ref="passwordInput"
      @update:model-value="validatePasswordConfirmation"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_lock" color="grey-7" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="passwordFieldType === 'password' ? 'sym_o_visibility_off' : 'sym_o_visibility'"
          @click="togglePasswordVisibility"
          class="cursor-pointer"
          color="grey-7"
        />
      </template>
      <template v-slot:error="{ message }">
        <div class="text-red-7 error-message-wrapper">{{ message }}</div>
      </template>
    </q-input>

    <q-input
      outlined
      v-model="form.confirmPassword"
      :type="confirmPasswordFieldType"
      label="Confirmar Contraseña *"
      aria-label="Confirmar Contraseña"
      :rules="confirmPasswordRules"
      autocomplete="new-password"
      color="primary"
      label-color="grey-7"
      input-class="text-grey-9"
      bottom-slots
      ref="confirmPasswordInput"
      @update:model-value="validatePasswordConfirmation"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_lock_reset" color="grey-7" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="
            confirmPasswordFieldType === 'password' ? 'sym_o_visibility_off' : 'sym_o_visibility'
          "
          @click="toggleConfirmPasswordVisibility"
          class="cursor-pointer"
          color="grey-7"
        />
      </template>
      <template v-slot:error="{ message }">
        <div class="text-red-7 error-message-wrapper">{{ message }}</div>
      </template>
    </q-input>

    <div>
      <q-btn
        label="Registrarse"
        type="submit"
        color="accent"
        unelevated
        class="full-width q-py-sm"
        :loading="loading"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from 'src/services/auth.service'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

// --- Estados Reactivos (Diseño/UX) ---
const loading = ref(false)
const passwordFieldType = ref('password')
const confirmPasswordFieldType = ref('password')

// --- Referencias a los campos para validación manual ---
const myForm = ref(null) // Referencia al q-form
const passwordInput = ref(null) // Referencia al q-input de contraseña
const confirmPasswordInput = ref(null) // Referencia al q-input de confirmar contraseña

// --- Lógica de Formulario (Alineado con tu JSON de Backend) ---
const form = ref({
  email: '',
  username: '',
  password: '',
  confirmPassword: '', // Solo para UX
  role: 'USERS', // Valor por defecto para el backend
})

// --- Validaciones ---
const emailRules = [
  (val) => (val && val.length > 0) || 'Por favor, ingresa el correo electrónico',
  (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un correo electrónico válido',
]
const usernameRules = [
  (val) => (val && val.length > 0) || 'Por favor, ingresa un nombre de usuario',
]
const passwordRules = [
  (val) => (val && val.length > 0) || 'Por favor, ingresa la contraseña',
  (val) => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  (val) => val === form.value.confirmPassword || 'Las contraseñas no coinciden',
]
const confirmPasswordRules = [
  (val) => (val && val.length > 0) || 'Por favor, confirma tu contraseña',
  (val) => val === form.value.password || 'Las contraseñas no coinciden',
]

// --- Función para forzar la validación de ambos campos de contraseña ---
// Se llama cada vez que password o confirmPassword cambia
const validatePasswordConfirmation = () => {
  // Asegurarse de que las referencias existan antes de llamar a validate()
  if (passwordInput.value) {
    passwordInput.value.validate()
  }
  if (confirmPasswordInput.value) {
    confirmPasswordInput.value.validate()
  }
}

// --- Funciones de Visibilidad de Contraseña (Diseño/UX) ---
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}
const toggleConfirmPasswordVisibility = () => {
  confirmPasswordFieldType.value =
    confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
}

// --- Lógica de Envío (Alineada con tu JSON de Backend y UX) ---
const onSubmit = async () => {
  loading.value = true
  try {
    // Es buena práctica llamar a validate() del formulario completo antes de enviar
    // aunque los campos se validan en tiempo real, esto asegura una última verificación.
    const isValid = await myForm.value.validate()
    if (!isValid) {
      loading.value = false
      return // Detener el envío si la validación falla
    }

    const payload = {
      email: form.value.email,
      username: form.value.username,
      password: form.value.password,
      role: form.value.role,
    }

    const response = await AuthService.register(payload)
    localStorage.setItem('authToken', response.accesToken)
    $q.notify({
      message: '¡Bienvenido! Registro exitoso',
      color: 'positive',
      icon: 'sym_o_check_circle',
      position: 'top',
    })
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al registrar usuario.'
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'sym_o_error',
      position: 'top',
    })
    console.error('Error al registrar:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.q-btn.full-width {
  margin-top: 16px;
}

// Estilo para los mensajes de error para evitar que se desborden
.q-field__messages {
  word-break: break-word; // Permite que las palabras largas se rompan y pasen a la siguiente línea
  white-space: normal; // Asegura que el texto fluya normalmente y no permanezca en una sola línea
  line-height: 1.2; // Ajusta el interlineado para mejor legibilidad en múltiples líneas
  padding-top: 2px; // Un poco de padding para que no quede pegado al input
}

.error-message-wrapper {
  width: 100%; // Asegura que ocupe todo el ancho disponible del slot
  word-break: break-word; // Permite romper palabras
  white-space: normal; // Permite salto de línea
  box-sizing: border-box; // Asegura que padding/border se incluyan en el ancho
  padding-right: 5px; // Pequeño padding para evitar que toque el borde derecho si hay uno
}

.q-field__messages.q-field__messages--error {
  color: var(--q-red-7);
  font-weight: 600;
}

/*
  Nota: La regla para ocultar el ícono de error del QInput fue movida a src/css/app.scss
  para asegurar que tenga el alcance y la especificidad global necesaria.
*/
</style>
