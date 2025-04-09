<!-- src/pages/vehicle/VehicleDetailsPage.vue -->
<template>
  <div class="q-pa-md">
    <vehicle-details />
  </div>
</template>

<script>
import VehicleDetails from 'src/components/vehicle/VehicleDetails.vue'

export default {
  name: 'VehicleDetailsPage',
  components: {
    VehicleDetails,
  },
}
</script>
