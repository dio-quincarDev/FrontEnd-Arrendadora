<template>
  <q-page class="row justify-center items-center">
    <div class="col-md-6 col-sm-8 col-xs-11">
      <q-card>
        <q-card-section>
          <div class="text-h6">Registrarse</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <register-form />
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
          ¿Ya tienes una cuenta? <q-btn flat to="/login" label="Inicia sesión aquí" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import RegisterForm from 'src/components/auth/RegisterForm.vue'
</script>
