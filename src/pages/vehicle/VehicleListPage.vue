<!-- src/pages/vehicle/VehicleListPage.vue -->
<template>
  <div class="q-pa-md">
    <q-btn
      label="Nuevo Vehículo"
      color="primary"
      @click="$router.push('/vehicles/create')"
      class="q-mb-md"
    />
    <vehicle-table />
  </div>
</template>

<script>
import VehicleTable from 'src/components/vehicle/VehicleTable.vue'

export default {
  name: 'VehicleListPage',
  components: {
    VehicleTable,
  },
}
</script>
