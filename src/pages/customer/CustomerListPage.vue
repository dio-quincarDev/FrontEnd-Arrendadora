<template>
  <q-page padding>
    <div class="q-mb-md">
      <q-btn to="/customers/create" color="primary" label="Crear Nuevo Cliente" />
    </div>
    <customer-table />
  </q-page>
</template>

<script setup>
import CustomerTable from 'src/components/customer/CustomerTable.vue'
</script>
