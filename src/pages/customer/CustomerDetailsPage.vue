<template>
  <q-page padding>
    <div class="q-mb-md">
      <q-btn to="/customers" color="primary" label="Volver a la Lista" />
    </div>
    <div class="q-mt-md">
      <customer-details :id="$route.params.id" />
    </div>
  </q-page>
</template>

<script setup>
import CustomerDetails from 'src/components/customer/CustomerDetails.vue'
import { useRoute } from 'vue-router'

// eslint-disable-next-line no-unused-vars
const route = useRoute()
</script>
