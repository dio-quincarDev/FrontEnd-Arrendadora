<template>
  <q-page padding>
    <div class="q-mb-md">
      <q-btn to="/customers" color="primary" label="Volver a la Lista" />
    </div>
    <div class="q-mt-md">
      <customer-form />
    </div>
  </q-page>
</template>

<script setup>
import CustomerForm from 'src/components/customer/CustomerForm.vue'
</script>
