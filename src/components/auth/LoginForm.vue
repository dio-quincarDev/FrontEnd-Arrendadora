<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      filled
      v-model="form.email"
      label="Correo Electrónico *"
      aria-label="Correo electrónico"
      lazy-rules
      :rules="emailRules"
      autocomplete="username"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_mail" />
      </template>
    </q-input>

    <q-input
      filled
      v-model="form.password"
      :type="passwordFieldType"
      label="Contraseña *"
      aria-label="Contraseña"
      lazy-rules
      :rules="passwordRules"
      autocomplete="current-password"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_lock" />
      </template>
      <template v-slot:append>
        <q-icon
          :name="passwordFieldType === 'password' ? 'sym_o_visibility_off' : 'sym_o_visibility'"
          @click="togglePasswordVisibility"
          class="cursor-pointer"
        />
      </template>
    </q-input>

    <div class="text-right q-mt-md">
      <q-btn
        flat
        label="¿Olvidaste tu contraseña?"
        color="accent"
        class="text-capitalize"
        to="/auth/forgot-password"
      />
    </div>

    <div>
      <q-btn
        label="Iniciar Sesión"
        type="submit"
        color="accent"
        unelevated
        class="full-width"
        :loading="loading"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
// import { useRouter } from 'vue-router'; // <--- ¡Eliminada esta importación!
import AuthService from 'src/services/auth.service'
import { useQuasar } from 'quasar'

// --- Estado de Carga (UX VISUAL) ---
const loading = ref(false)

// --- Visibilidad de Contraseña (UX VISUAL) ---
const passwordFieldType = ref('password')

// --- Función para alternar la visibilidad (UX VISUAL) ---
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

// --- Lógica Existente (NO MODIFICADA) ---
// const router = useRouter(); // <--- ¡Eliminada esta declaración!
const $q = useQuasar()
const form = ref({
  email: '',
  password: '',
})

const emailRules = [
  (val) => (val && val.length > 0) || 'Por favor, ingresa el correo electrónico',
  (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un correo electrónico válido',
]
const passwordRules = [(val) => (val && val.length > 0) || 'Por favor, ingresa la contraseña']

const emit = defineEmits(['login-success'])

const onSubmit = async () => {
  loading.value = true
  try {
    const response = await AuthService.login(form.value)
    localStorage.setItem('authToken', response.accesToken)
    $q.notify({
      message: 'Inicio de sesión exitoso',
      color: 'positive',
      icon: 'sym_o_check_circle',
      position: 'top',
    })
    emit('login-success')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Credenciales inválidas.'
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'sym_o_error',
      position: 'top',
    })
    console.error('Error al iniciar sesión:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.q-btn.full-width {
  margin-top: 16px;
}
</style>
