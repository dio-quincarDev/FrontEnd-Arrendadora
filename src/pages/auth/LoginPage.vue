<template>
  <q-page class="row justify-center items-center">
    <div class="col-md-4 col-sm-6 col-xs-10">
      <q-card>
        <q-card-section>
          <div class="text-h6">Iniciar Sesión</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <login-form @login-success="handleLoginSuccess" />
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
          ¿No tienes una cuenta? <q-btn flat to="/auth/register" label="Regístrate aquí" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import LoginForm from 'src/components/auth/LoginForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLoginSuccess = () => {
  router.push('/') // Redirigir a la página principal después del inicio de sesión
}
</script>
