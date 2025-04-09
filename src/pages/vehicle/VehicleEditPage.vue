<!-- src/pages/vehicle/VehicleEditPage.vue -->
<template>
  <div class="q-pa-md">
    <h2>Editar Vehículo</h2>
    <vehicle-form />
  </div>
</template>

<script>
import VehicleForm from 'src/components/vehicle/VehicleForm.vue'

export default {
  name: 'VehicleEditPage',
  components: {
    VehicleForm,
  },
}
</script>
