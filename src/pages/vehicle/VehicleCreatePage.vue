<!-- src/pages/vehicle/VehicleCreatePage.vue -->
<template>
  <div class="q-pa-md">
    <h2>Crear Vehículo</h2>
    <vehicle-form />
  </div>
</template>

<script>
import VehicleForm from 'src/components/vehicle/VehicleForm.vue'

export default {
  name: 'VehicleCreatePage',
  components: {
    VehicleForm,
  },
}
</script>
