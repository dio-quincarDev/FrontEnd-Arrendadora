<template>
  <div>
    <h1>Detalles de la Renta #{{ $route.params.id }}</h1>
    <rental-details :rentalId="$route.params.id" />
  </div>
</template>

<script>
import RentalDetails from 'src/components/rental/RentalDetails.vue'

export default {
  name: 'RentalDetailsPage',
  components: {
    RentalDetails,
  },
}
</script>
