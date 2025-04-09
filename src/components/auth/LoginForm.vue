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
      v-model="form.password"
      type="password"
      label="Contraseña *"
      aria-label="Contraseña"
      lazy-rules
      :rules="passwordRules"
    />
    <div>
      <q-btn label="Iniciar Sesión" type="submit" color="primary" />
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
  password: '',
})

// Reutilización de validaciones
const emailRules = [
  (val) => (val && val.length > 0) || 'Por favor, ingresa el correo electrónico',
  (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un correo electrónico válido',
]
const passwordRules = [(val) => (val && val.length > 0) || 'Por favor, ingresa la contraseña']

const emit = defineEmits(['login-success']) // Emisión de eventos para comunicación

const onSubmit = async () => {
  try {
    const response = await AuthService.login(form.value)
    localStorage.setItem('authToken', response.accesToken) // Guarda el token de acceso
    $q.notify({
      message: 'Inicio de sesión exitoso',
      color: 'positive',
      icon: 'check',
    })
    emit('login-success')
    router.push('/') // Redirigir después del inicio de sesión
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Credenciales inválidas.'
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'warning',
    })
    console.error('Error al iniciar sesión:', error)
  }
}
</script>
