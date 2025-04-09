<template>
  <q-page padding>
    <div class="q-mb-md">
      <q-btn :to="`/customers/${$route.params.id}`" color="primary" label="Ver Detalles" />
      <q-btn to="/customers" class="q-ml-sm" color="primary" label="Volver a la Lista" />
    </div>
    <div class="q-mt-md">
      <customer-form :id="$route.params.id" />
    </div>
  </q-page>
</template>

<script setup>
import CustomerForm from 'src/components/customer/CustomerForm.vue'
import { useRoute } from 'vue-router'

// eslint-disable-next-line no-unused-vars
const route = useRoute()
</script>
