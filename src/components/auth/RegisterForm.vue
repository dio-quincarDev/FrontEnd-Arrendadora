<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      filled
      v-model="form.email"
      label="Correo electrónico *"
      aria-label="Correo electrónico"
      lazy-rules
      :rules="emailRules"
    />
    <q-input
      filled
      v-model="form.username"
      label="Nombre de usuario *"
      aria-label="Nombre de usuario"
      lazy-rules
      :rules="usernameRules"
    />
    <q-input
      filled
      v-model="form.password"
      type="password"
      label="Contraseña *"
      aria-label="Contraseña"
      lazy-rules
      :rules="passwordRules"
    />
    <q-select
      filled
      v-model="form.role"
      label="Rol"
      aria-label="Rol"
      :options="roleOptions"
      option-value="value"
      option-label="label"
    />
    <div>
      <q-btn label="Registrarse" type="submit" color="primary" />
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
const form = ref({
  email: '',
  username: '',
  password: '',
  role: 'USER', // Valor predeterminado
})

// Validaciones separadas para reutilización
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
]

// Opciones de rol modularizadas para reutilización
const roleOptions = ref([
  { label: 'Usuario', value: 'USER' },
  { label: 'Administrador', value: 'ADMIN' },
])

const onSubmit = async () => {
  try {
    const response = await AuthService.register(form.value)
    localStorage.setItem('authToken', response.accesToken) // Guarda el token de acceso
    $q.notify({
      message: 'Registro exitoso',
      color: 'positive',
      icon: 'check',
    })
    router.push('/') // Redirigir después del registro
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al registrar usuario.'
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'warning',
    })
    console.error('Error al registrar:', error)
  }
}
</script>
