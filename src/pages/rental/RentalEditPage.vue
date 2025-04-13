<template>
  <div>
    <h1>Editar Renta #{{ $route.params.id }}</h1>
    <rental-form :rentalId="$route.params.id" />
  </div>
</template>

<script>
import RentalForm from 'src/components/rental/RentalForm.vue'

export default {
  name: 'RentalEditPage',
  components: {
    RentalForm,
  },
}
</script>
