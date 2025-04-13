<template>
  <div class="q-pa-md">
    <q-btn
      label="Nueva Renta"
      color="primary"
      @click="$router.push('/rentals/create')"
      class="q-mb-md"
    />
    <rental-table />
  </div>
</template>

<script>
import RentalTable from 'src/components/rental/RentalTable.vue'

export default {
  name: 'RentalListPage',
  components: {
    RentalTable,
  },
}
</script>
