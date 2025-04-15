<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">Gestión de Alquileres</div>
      <rental-table />
    </div>
  </q-page>
</template>

<script>
import RentalTable from 'components/rental/RentalTable.vue'

export default {
  name: 'RentalList',
  components: {
    RentalTable,
  },
}
</script>
